import { error } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

const THUMBNAILS_DIR = path.join(process.cwd(), 'worlds', 'thumbnails');

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;
	
	if (!filename) {
		return error(400, 'Filename is required');
	}

	try {
		// Sanitize filename to prevent directory traversal
		const sanitizedFilename = path.basename(filename);
		const thumbnailPath = path.join(THUMBNAILS_DIR, sanitizedFilename);

		// Check if thumbnail exists
		try {
			await fs.access(thumbnailPath);
		} catch {
			// Return a default placeholder image or 404
			return error(404, 'Thumbnail not found');
		}

		// Read and return the thumbnail
		const thumbnailBuffer = await fs.readFile(thumbnailPath);
		
		// Determine content type based on file extension
		const ext = path.extname(sanitizedFilename).toLowerCase();
		let contentType = 'image/png'; // default
		
		switch (ext) {
			case '.jpg':
			case '.jpeg':
				contentType = 'image/jpeg';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.webp':
				contentType = 'image/webp';
				break;
			case '.gif':
				contentType = 'image/gif';
				break;
		}

		return new Response(thumbnailBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
				'Content-Length': thumbnailBuffer.length.toString()
			}
		});

	} catch (err) {
		console.error('Error serving thumbnail:', err);
		return error(500, 'Failed to serve thumbnail');
	}
};