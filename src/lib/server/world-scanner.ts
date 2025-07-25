/**
 * World Scanner Service - TypeScript port of PHP WorldScanner
 * Scans and analyzes Minecraft world files from mounted directory
 */

import { readdir, stat, access } from 'fs/promises';
import { join, basename } from 'path';
import { constants } from 'fs';
import type { World, WorldCategory, WorldStatistics } from '$lib/types/world.js';
import { config } from '$lib/config.js';

export class WorldScanner {
	private worldsPath: string;
	private downloadCounts: Map<string, number> = new Map();

	constructor(worldsPath?: string) {
		this.worldsPath = worldsPath || config.worldsDir;
	}

	/**
	 * Scan all worlds in the configured directory
	 */
	async scanAllWorlds(): Promise<{ worlds: World[]; statistics: WorldStatistics }> {
		try {
			// Check if worlds directory exists and is accessible
			await access(this.worldsPath, constants.R_OK);
			
			const files = await readdir(this.worldsPath);
			const worlds: World[] = [];
			const statistics: WorldStatistics = {
				total_worlds: 0,
				total_size: 0,
				total_downloads: 0,
				categories: {
					'All The Mods': 0,
					'Create': 0,
					'Stoneblock': 0,
					'Tekkit': 0,
					'SkyFactory': 0,
					'Project Architect': 0,
					'Other': 0
				}
			};

			// Load download counts
			await this.loadDownloadCounts();

			for (const file of files) {
				if (file === '.' || file === '..') continue;

				const filePath = join(this.worldsPath, file);
				
				try {
					const fileStat = await stat(filePath);
					if (!fileStat.isFile()) continue;

					const worldInfo = await this.scanWorld(file, filePath, fileStat);
					if (worldInfo) {
						worlds.push(worldInfo);
						
						// Update statistics
						statistics.total_worlds++;
						statistics.total_size += worldInfo.size;
						statistics.total_downloads += worldInfo.downloads;
						statistics.categories[worldInfo.category]++;
					}
				} catch (error) {
					console.warn(`Failed to scan world file ${file}:`, error);
					continue;
				}
			}

			// Sort worlds by display name
			worlds.sort((a, b) => a.displayName.localeCompare(b.displayName));

			return { worlds, statistics };
		} catch (error) {
			console.error('Failed to scan worlds directory:', error);
			throw new Error(`Failed to access worlds directory: ${this.worldsPath}`);
		}
	}

	/**
	 * Scan a single world file and extract information
	 */
	async scanWorld(filename: string, filePath: string, fileStat?: any): Promise<World | null> {
		try {
			if (!fileStat) {
				fileStat = await stat(filePath);
			}

			if (!fileStat.isFile()) {
				return null;
			}

			// Validate filename
			if (!this.isValidFilename(filename)) {
				return null;
			}

			const info: World = {
				filename,
				displayName: this.parseDisplayName(filename),
				size: fileStat.size,
				formatted_size: this.formatBytes(fileStat.size),
				modified: fileStat.mtime.toISOString(),
				formatted_modified: this.formatDate(fileStat.mtime),
				downloads: this.getDownloadCount(filename),
				category: this.parseCategory(filename),
				group: this.parseGroup(filename),
				version: this.parseVersion(filename),
				description: this.generateDescription(filename),
				tags: this.parseTags(filename),
				download_url: this.generateDownloadUrl(filename)
			};

			return info;
		} catch (error) {
			console.error(`Error scanning world file ${filename}:`, error);
			return null;
		}
	}

	/**
	 * Parse display name from filename
	 */
	private parseDisplayName(filename: string): string {
		// Remove extension
		let name = filename.replace(/\.(tar\.xz|zip|rar|7z)$/i, '');
		
		// Replace underscores with spaces
		name = name.replace(/_/g, ' ');
		
		// Capitalize words
		name = name.replace(/\b\w/g, l => l.toUpperCase());
		
		// Handle special cases
		const replacements: Record<string, string> = {
			'Atm': 'ATM',
			'Sf': 'SF',
			'Tts': 'TTS',
			'Jei': 'JEI'
		};
		
		for (const [search, replace] of Object.entries(replacements)) {
			name = name.replace(new RegExp(`\\b${search}\\b`, 'g'), replace);
		}
		
		return name;
	}

	/**
	 * Parse category from filename
	 */
	private parseCategory(filename: string): WorldCategory {
		const lowerFilename = filename.toLowerCase();
		
		if (lowerFilename.includes('atm') || lowerFilename.includes('allthemods')) {
			return 'All The Mods';
		} else if (lowerFilename.includes('create')) {
			return 'Create';
		} else if (lowerFilename.includes('stoneblock')) {
			return 'Stoneblock';
		} else if (lowerFilename.includes('tekkit')) {
			return 'Tekkit';
		} else if (lowerFilename.includes('sf')) {
			return 'SkyFactory';
		} else if (lowerFilename.includes('project') && lowerFilename.includes('architect')) {
			return 'Project Architect';
		} else {
			return 'Other';
		}
	}

	/**
	 * Parse group from filename
	 */
	private parseGroup(filename: string): string {
		const lowerFilename = filename.toLowerCase();
		
		if (lowerFilename.includes('atm9')) return 'ATM9';
		if (lowerFilename.includes('atm10')) return 'ATM10';
		if (lowerFilename.includes('create')) return 'Create';
		if (lowerFilename.includes('stoneblock3')) return 'Stoneblock 3';
		if (lowerFilename.includes('tekkit')) return 'Tekkit';
		if (lowerFilename.includes('sf5')) return 'SkyFactory 5';
		if (lowerFilename.includes('project_architect')) return 'Project Architect';
		
		return 'Misc';
	}

	/**
	 * Parse version from filename
	 */
	private parseVersion(filename: string): string | undefined {
		const versionMatch = filename.match(/(\d+\.?\d*\.?\d*)/);
		return versionMatch ? versionMatch[1] : undefined;
	}

	/**
	 * Generate description based on category and version
	 */
	private generateDescription(filename: string): string {
		const category = this.parseCategory(filename);
		const version = this.parseVersion(filename);
		
		const descriptions: Record<WorldCategory, string> = {
			'All The Mods': 'A comprehensive modpack world with hundreds of mods for endless possibilities.',
			'Create': 'An engineering-focused world featuring the Create mod for mechanical contraptions.',
			'Stoneblock': 'A unique skyblock-style world where you start in a world of stone.',
			'Tekkit': 'Classic tech-focused gameplay with industrial and automation mods.',
			'SkyFactory': 'Sky-based survival with resource generation and automation.',
			'Project Architect': 'A curated modpack focusing on building and automation.',
			'Other': 'A custom Minecraft world with unique features and gameplay.'
		};
		
		let baseDesc = descriptions[category];
		
		if (version) {
			baseDesc += ` Version ${version}.`;
		}
		
		return baseDesc;
	}

	/**
	 * Parse tags from filename
	 */
	private parseTags(filename: string): string[] {
		const tags: string[] = [];
		const lowerFilename = filename.toLowerCase();
		
		if (lowerFilename.includes('atm')) tags.push('modded');
		if (lowerFilename.includes('create')) tags.push('engineering');
		if (lowerFilename.includes('tech')) tags.push('technology');
		if (lowerFilename.includes('magic')) tags.push('magic');
		if (lowerFilename.includes('sky')) tags.push('skyblock');
		if (lowerFilename.includes('stone')) tags.push('challenge');
		
		return tags;
	}

	/**
	 * Get download count for a file
	 */
	private getDownloadCount(filename: string): number {
		return this.downloadCounts.get(filename) || 0;
	}

	/**
	 * Increment download count for a file
	 */
	async incrementDownloadCount(filename: string): Promise<void> {
		const currentCount = this.getDownloadCount(filename);
		this.downloadCounts.set(filename, currentCount + 1);
		
		// In a real implementation, this would persist to a database or file
		// For now, we'll keep it in memory
		console.log(`Download count for ${filename} incremented to ${currentCount + 1}`);
	}

	/**
	 * Load download counts from persistent storage
	 */
	private async loadDownloadCounts(): Promise<void> {
		// In a real implementation, this would load from a database or file
		// For now, we'll initialize with empty counts
		this.downloadCounts.clear();
	}

	/**
	 * Format bytes to human readable format
	 */
	private formatBytes(bytes: number, precision = 2): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size > 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(precision)} ${units[unitIndex]}`;
	}

	/**
	 * Format date to human readable format
	 */
	private formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	/**
	 * Generate download URL for a file
	 */
	private generateDownloadUrl(filename: string): string {
		if (!this.isValidFilename(filename)) {
			return '';
		}
		return `/api/download/${encodeURIComponent(filename)}`;
	}

	/**
	 * Validate filename for security
	 */
	private isValidFilename(filename: string): boolean {
		// Reject any filename containing directory traversal attempts
		if (filename.includes('..')) {
			return false;
		}
		
		// Reject absolute paths
		if (filename.startsWith('/') || filename.startsWith('\\')) {
			return false;
		}
		
		// Reject any path separators
		if (filename.includes('/') || filename.includes('\\')) {
			return false;
		}
		
		// Only allow specific file extensions
		const allowedExtensions = ['.tar.xz', '.zip', '.rar', '.7z'];
		const hasValidExtension = allowedExtensions.some(ext => 
			filename.toLowerCase().endsWith(ext)
		);
		
		if (!hasValidExtension) {
			return false;
		}
		
		// Filename should only contain safe characters
		if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
			return false;
		}
		
		return true;
	}

	/**
	 * Check if a filename is allowed (exists in our worlds directory)
	 */
	async isAllowedWorldFile(filename: string): Promise<boolean> {
		if (!this.isValidFilename(filename)) {
			return false;
		}
		
		try {
			const filePath = join(this.worldsPath, filename);
			await access(filePath, constants.R_OK);
			
			const fileStat = await stat(filePath);
			return fileStat.isFile();
		} catch {
			return false;
		}
	}

	/**
	 * Get the worlds directory path
	 */
	getWorldsPath(): string {
		return this.worldsPath;
	}
}