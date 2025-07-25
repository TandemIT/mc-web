/**
 * File Download API Endpoint
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorldScanner } from '$lib/server/world-scanner.js';
import { FileHandler } from '$lib/server/file-handler.js';

const scanner = new WorldScanner();
const fileHandler = new FileHandler();

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { filename } = params;

		if (!filename) {
			return error(400, {
				message: 'Filename parameter is required'
			});
		}

		// Security: Validate filename and check if it's allowed
		if (!await scanner.isAllowedWorldFile(filename)) {
			return error(403, {
				message: 'File not found or access denied'
			});
		}

		// Get file stream and info
		const { stream, size, mimeType } = await fileHandler.serveFile(filename);

		// Increment download count
		await scanner.incrementDownloadCount(filename);

		// Sanitize filename for download
		const safeFilename = fileHandler.sanitizeFilename(filename);

		// Set headers for file download
		const headers = new Headers({
			'Content-Type': mimeType,
			'Content-Disposition': `attachment; filename="${safeFilename}"`,
			'Content-Length': size.toString(),
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		});

		// Return the file stream
		return new Response(stream as any, {
			status: 200,
			headers
		});

	} catch (err) {
		console.error('Error in download API:', err);
		
		if (err instanceof Error) {
			if (err.message.includes('not found')) {
				return error(404, { message: 'File not found' });
			}
			if (err.message.includes('Access denied')) {
				return error(403, { message: 'Access denied' });
			}
		}
		
		return error(500, 'Failed to download file');
	}
};

export const HEAD: RequestHandler = async ({ params }) => {
	try {
		const { filename } = params;

		if (!filename) {
			return new Response(null, { status: 400 });
		}

		// Security: Validate filename and check if it's allowed
		if (!await scanner.isAllowedWorldFile(filename)) {
			return new Response(null, { status: 403 });
		}

		// Get file info
		const fileInfo = await fileHandler.getFileInfo(filename);
		
		if (!fileInfo.exists) {
			return new Response(null, { status: 404 });
		}

		const safeFilename = fileHandler.sanitizeFilename(filename);

		return new Response(null, {
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename="${safeFilename}"`,
				'Content-Length': fileInfo.size.toString(),
				'Cache-Control': 'no-cache'
			}
		});

	} catch (err) {
		return new Response(null, { status: 500 });
	}
};