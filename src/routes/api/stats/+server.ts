import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTotalDownloads } from '$lib/db/queries.js';
import { scanWorlds } from '$lib/server/worldScanner.js';

export const GET: RequestHandler = async () => {
	try {
		const { statistics } = await scanWorlds();
		const totalDownloads = await getTotalDownloads();
		
		return json({
			success: true,
			statistics: {
				...statistics,
				total_downloads: totalDownloads
			}
		});
		
	} catch (error) {
		console.error('Stats API Error:', error);
		return json({
			success: false,
			error: 'STATS_FAILED',
			message: 'Failed to get statistics'
		}, { status: 500 });
	}
};