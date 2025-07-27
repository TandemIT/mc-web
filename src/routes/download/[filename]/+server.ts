import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { validateFilename } from '$lib/utils/validation.js';
import { incrementDownload } from '$lib/db/queries.js';
import { WORLDS_DIRECTORY } from '$lib/utils/constants.js';

export const GET: RequestHandler = async ({ params, request, getClientAddress }) => {
	const { filename } = params;
	
	// Validate filename
	if (!validateFilename(filename)) {
		throw error(400, 'Invalid filename');
	}
	
	const filePath = join(WORLDS_DIRECTORY, filename);
	
	// Check if file exists
	if (!existsSync(filePath)) {
		throw error(404, 'File not found');
	}
	
	try {
		// Get file stats
		const fileStats = await stat(filePath);
		
		// Get client info for logging
		const clientAddress = getClientAddress();
		const userAgent = request.headers.get('user-agent') || undefined;
		
		// Increment download counter
		await incrementDownload(filename, clientAddress, userAgent);
		
		// Create file stream
		const stream = createReadStream(filePath);
		
		// Determine content type based on extension
		let contentType = 'application/octet-stream';
		if (filename.endsWith('.tar.xz')) {
			contentType = 'application/x-xz';
		} else if (filename.endsWith('.zip')) {
			contentType = 'application/zip';
		} else if (filename.endsWith('.tar.gz')) {
			contentType = 'application/gzip';
		}
		
		// Return file with appropriate headers
		return new Response(stream as any, {
			headers: {
				'Content-Type': contentType,
				'Content-Length': fileStats.size.toString(),
				'Content-Disposition': `attachment; filename="${filename}"`,
				'Cache-Control': 'public, max-age=3600',
				'Last-Modified': fileStats.mtime.toUTCString()
			}
		});
		
	} catch (err) {
		console.error('Download error:', err);
		throw error(500, 'Failed to download file');
	}
};