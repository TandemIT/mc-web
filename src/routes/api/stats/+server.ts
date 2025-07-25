/**
 * Statistics API Endpoint
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorldScanner } from '$lib/server/world-scanner.js';
import { cache } from '$lib/server/cache.js';
import type { StatsResponse } from '$lib/types/api.js';

const CACHE_KEY = 'world_statistics';
const scanner = new WorldScanner();

export const GET: RequestHandler = async () => {
	try {
		// Try to get from cache first
		const cachedStats = cache.get<StatsResponse['data']>(CACHE_KEY);
		if (cachedStats) {
			return json({
				success: true,
				data: cachedStats
			} satisfies StatsResponse);
		}

		// If not in cache, scan worlds to get fresh statistics
		const { statistics } = await scanner.scanAllWorlds();
		
		const responseData = {
			statistics
		};

		// Cache the statistics
		cache.set(CACHE_KEY, responseData, 300); // 5 minutes TTL

		return json({
			success: true,
			data: responseData
		} satisfies StatsResponse);

	} catch (err) {
		console.error('Error in stats API:', err);
		
		return error(500, 'Failed to get statistics');
	}
};