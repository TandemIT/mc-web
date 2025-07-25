/**
 * Individual World Info API Endpoint
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorldScanner } from '$lib/server/world-scanner.js';
import { FileHandler } from '$lib/server/file-handler.js';
import type { WorldInfoResponse } from '$lib/types/api.js';

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

		// Validate filename
		if (!await scanner.isAllowedWorldFile(filename)) {
			return error(404, {
				message: 'World file not found or not allowed'
			});
		}

		// Get file info
		const fileInfo = await fileHandler.getFileInfo(filename);
		
		if (!fileInfo.exists) {
			return error(404, {
				message: 'World file not found'
			});
		}

		// Scan the specific world
		const worldInfo = await scanner.scanWorld(filename, '', {
			size: fileInfo.size,
			mtime: fileInfo.modified,
			isFile: () => true
		});

		if (!worldInfo) {
			return error(500, {
				message: 'Failed to scan world file'
			});
		}

		return json({
			success: true,
			data: {
				world: worldInfo
			}
		} satisfies WorldInfoResponse);

	} catch (err) {
		console.error('Error in world info API:', err);
		
		return error(500, 'Failed to get world information');
	}
};