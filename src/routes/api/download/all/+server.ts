/**
 * Bulk Download API Endpoint - Download all worlds as a single archive
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorldScanner } from '$lib/server/world-scanner.js';
import { FileHandler } from '$lib/server/file-handler.js';
import { createReadStream } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

const scanner = new WorldScanner();
const fileHandler = new FileHandler();

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get all available worlds
		const { worlds } = await scanner.scanAllWorlds();
		
		if (worlds.length === 0) {
			return error(404, {
				message: 'No worlds available for download'
			});
		}

		// Create a zip archive
		const archive = archiver('zip', {
			zlib: { level: 9 } // Maximum compression
		});

		// Handle archive errors
		archive.on('error', (err) => {
			console.error('Archive error:', err);
			throw err;
		});

		// Add all world files to the archive
		for (const world of worlds) {
			try {
				const filePath = join(scanner.getWorldsPath(), world.filename);
				const stream = createReadStream(filePath);
				archive.append(stream, { name: world.filename });
			} catch (err) {
				console.warn(`Failed to add ${world.filename} to archive:`, err);
				// Continue with other files
			}
		}

		// Finalize the archive
		archive.finalize();

		// Generate filename with timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const filename = `minecraft-worlds-${timestamp}.zip`;

		// Set headers for download
		const headers = new Headers({
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${filename}"`,
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		});

		// Convert archive to ReadableStream
		const readableStream = new ReadableStream({
			start(controller) {
				archive.on('data', (chunk) => {
					controller.enqueue(chunk);
				});
				
				archive.on('end', () => {
					controller.close();
				});
				
				archive.on('error', (err) => {
					controller.error(err);
				});
			}
		});

		// Increment download counts for all worlds
		for (const world of worlds) {
			try {
				await scanner.incrementDownloadCount(world.filename);
			} catch (err) {
				console.warn(`Failed to increment download count for ${world.filename}:`, err);
			}
		}

		return new Response(readableStream, {
			status: 200,
			headers
		});

	} catch (err) {
		console.error('Error in bulk download API:', err);
		
		return error(500, 'Failed to create bulk download');
	}
};

export const HEAD: RequestHandler = async () => {
	try {
		// Get all available worlds to calculate approximate size
		const { worlds, statistics } = await scanner.scanAllWorlds();
		
		if (worlds.length === 0) {
			return new Response(null, { status: 404 });
		}

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
		const filename = `minecraft-worlds-${timestamp}.zip`;

		return new Response(null, {
			status: 200,
			headers: {
				'Content-Type': 'application/zip',
				'Content-Disposition': `attachment; filename="${filename}"`,
				'X-Estimated-Size': statistics.total_size.toString(),
				'Cache-Control': 'no-cache'
			}
		});

	} catch (err) {
		return new Response(null, { status: 500 });
	}
};