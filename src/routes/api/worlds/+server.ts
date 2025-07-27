import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { scanWorlds } from '$lib/server/worldScanner.js';
import type { WorldsResponse } from '$lib/types/api.js';

let cache: WorldsResponse | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const GET: RequestHandler = async ({ url }) => {
	try {
		const now = Date.now();
		
		// Return cached data if still valid
		if (cache && now < cacheExpiry) {
			return json(cache);
		}
		
		// Scan worlds directory
		const { worlds, statistics } = await scanWorlds();
		
		// Apply filters if provided
		const category = url.searchParams.get('category');
		const search = url.searchParams.get('search');
		
		let filteredWorlds = worlds;
		
		if (category && category !== 'all') {
			filteredWorlds = filteredWorlds.filter(world => world.category === category);
		}
		
		if (search) {
			const searchLower = search.toLowerCase();
			filteredWorlds = filteredWorlds.filter(world =>
				world.displayName.toLowerCase().includes(searchLower) ||
				world.description.toLowerCase().includes(searchLower) ||
				world.tags.some(tag => tag.toLowerCase().includes(searchLower))
			);
		}
		
		// Create response
		const response: WorldsResponse = {
			success: true,
			worlds: filteredWorlds,
			statistics,
			generated_at: new Date().toISOString(),
			cache_expires: new Date(now + CACHE_TTL).toISOString()
		};
		
		// Update cache
		cache = response;
		cacheExpiry = now + CACHE_TTL;
		
		return json(response);
		
	} catch (error) {
		console.error('API Error:', error);
		return json({
			success: false,
			error: 'SCAN_FAILED',
			message: 'Failed to scan worlds directory'
		}, { status: 500 });
	}
};