/**
 * File Handler Service - Secure file operations
 */

import { createReadStream, createWriteStream } from 'fs';
import { stat, access, readdir } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { constants } from 'fs';
import { pipeline } from 'stream/promises';
import { config } from '$lib/config.js';

export class FileHandler {
	private worldsPath: string;

	constructor(worldsPath?: string) {
		this.worldsPath = worldsPath || config.worldsDir;
	}

	/**
	 * Securely serve a file for download
	 */
	async serveFile(filename: string): Promise<{
		stream: NodeJS.ReadableStream;
		size: number;
		mimeType: string;
	}> {
		// Validate filename
		if (!this.isValidFilename(filename)) {
			throw new Error('Invalid filename provided');
		}

		const filePath = join(this.worldsPath, filename);
		
		// Security: Ensure the resolved path is within our worlds directory
		const realWorldsPath = resolve(this.worldsPath);
		const realFilePath = resolve(filePath);
		
		if (!realFilePath.startsWith(realWorldsPath)) {
			throw new Error('Access denied: Path traversal detected');
		}

		// Check if file exists and is accessible
		try {
			await access(realFilePath, constants.R_OK);
		} catch {
			throw new Error('File not found or not accessible');
		}

		const fileStat = await stat(realFilePath);
		
		if (!fileStat.isFile()) {
			throw new Error('Path is not a file');
		}

		const stream = createReadStream(realFilePath);
		const mimeType = this.getMimeType(filename);

		return {
			stream,
			size: fileStat.size,
			mimeType
		};
	}

	/**
	 * Get file information
	 */
	async getFileInfo(filename: string): Promise<{
		size: number;
		modified: Date;
		exists: boolean;
	}> {
		if (!this.isValidFilename(filename)) {
			return { size: 0, modified: new Date(), exists: false };
		}

		const filePath = join(this.worldsPath, filename);
		
		try {
			const fileStat = await stat(filePath);
			return {
				size: fileStat.size,
				modified: fileStat.mtime,
				exists: fileStat.isFile()
			};
		} catch {
			return { size: 0, modified: new Date(), exists: false };
		}
	}

	/**
	 * List all valid world files in the directory
	 */
	async listWorldFiles(): Promise<string[]> {
		try {
			const files = await readdir(this.worldsPath);
			return files.filter(file => this.isValidFilename(file));
		} catch (error) {
			console.error('Failed to list world files:', error);
			return [];
		}
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
	 * Get MIME type based on file extension
	 */
	private getMimeType(filename: string): string {
		const ext = filename.toLowerCase();
		
		if (ext.endsWith('.tar.xz')) {
			return 'application/x-xz';
		} else if (ext.endsWith('.zip')) {
			return 'application/zip';
		} else if (ext.endsWith('.rar')) {
			return 'application/vnd.rar';
		} else if (ext.endsWith('.7z')) {
			return 'application/x-7z-compressed';
		}
		
		return 'application/octet-stream';
	}

	/**
	 * Sanitize filename for safe download
	 */
	sanitizeFilename(filename: string): string {
		// Remove any potentially dangerous characters
		return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
	}
}