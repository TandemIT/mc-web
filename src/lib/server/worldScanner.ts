import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { World, Statistics } from '../types/world.js';
import { WORLDS_DIRECTORY, CATEGORY_MAPPINGS, SUPPORTED_EXTENSIONS } from '../utils/constants.js';
import { formatFileSize, formatDate, createDisplayName, createDescription } from '../utils/formatting.js';
import { getDownloadStats } from '../db/queries.js';

/**
 * Parse filename according to compress.sh naming convention
 * Expected format: category__group__world_name__version.tar.xz
 * Example: atm__all_the_mods_9__my_world__1.0.43.tar.xz
 */
function parseFilename(filename: string) {
	// Remove extension
	const nameWithoutExt = filename.replace(/\.(tar\.xz|zip|tar\.gz)$/, '');
	
	// Split by double underscore
	const parts = nameWithoutExt.split('__');
	
	if (parts.length >= 3) {
		const [category, group, worldName, version] = parts;
		return {
			category: category || 'unknown',
			group: group || 'unknown',
			worldName: worldName || 'default',
			version: version || null
		};
	}
	
	// Fallback for non-standard naming
	return {
		category: 'unknown',
		group: 'unknown',
		worldName: nameWithoutExt,
		version: null
	};
}

/**
 * Scan worlds directory and return world data
 */
export async function scanWorlds(): Promise<{ worlds: World[]; statistics: Statistics }> {
	try {
		const files = await readdir(WORLDS_DIRECTORY);
		const downloadStats = await getDownloadStats();
		const downloadMap = new Map(downloadStats.map(d => [d.filename, d.count]));
		
		const worlds: World[] = [];
		const categories: Record<string, number> = {};
		let totalSize = 0;
		let totalDownloads = 0;
		
		for (const filename of files) {
			// Only process supported file types
			if (!SUPPORTED_EXTENSIONS.some(ext => filename.endsWith(ext))) {
				continue;
			}
			
			const filePath = join(WORLDS_DIRECTORY, filename);
			const stats = await stat(filePath);
			
			const parsed = parseFilename(filename);
			const downloads = downloadMap.get(filename) || 0;
			const categoryName = CATEGORY_MAPPINGS[parsed.category] || parsed.category;
			
			// Create tags from parsed data
			const tags = [
				categoryName,
				parsed.group.replace(/_/g, ' '),
				...(parsed.version ? [parsed.version] : [])
			];
			
			const world: World = {
				filename,
				displayName: createDisplayName(filename),
				size: stats.size,
				formatted_size: formatFileSize(stats.size),
				modified: stats.mtime.toISOString(),
				formatted_modified: formatDate(stats.mtime),
				downloads,
				category: parsed.category,
				group: parsed.group,
				version: parsed.version,
				description: createDescription(categoryName, parsed.group, parsed.version),
				tags,
				download_url: `/download/${encodeURIComponent(filename)}`
			};
			
			worlds.push(world);
			
			// Update statistics
			totalSize += stats.size;
			totalDownloads += downloads;
			categories[categoryName] = (categories[categoryName] || 0) + 1;
		}
		
		// Sort worlds by modified date (newest first)
		worlds.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
		
		const statistics: Statistics = {
			total_worlds: worlds.length,
			total_size: totalSize,
			total_downloads: totalDownloads,
			categories
		};
		
		return { worlds, statistics };
		
	} catch (error) {
		console.error('Error scanning worlds:', error);
		throw new Error('Failed to scan worlds directory');
	}
}