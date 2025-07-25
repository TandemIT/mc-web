/**
 * Worlds API Endpoint - Lists all available Minecraft worlds
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { WorldScanner } from '$lib/server/world-scanner.js';
import { cache } from '$lib/server/cache.js';
import type { WorldsListResponse } from '$lib/types/api.js';

const CACHE_KEY = 'worlds_list';
const scanner = new WorldScanner();

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Check for refresh parameter
		const refresh = url.searchParams.get('refresh') === 'true';
		
		// Try to get from cache first (unless refresh is requested)
		if (!refresh) {
			const cachedData = cache.get<WorldsListResponse['data']>(CACHE_KEY);
			if (cachedData) {
				return json({
					success: true,
					data: cachedData
				} satisfies WorldsListResponse);
			}
		}

		// Scan worlds directory
		const { worlds, statistics } = await scanner.scanAllWorlds();
		
		const responseData = {
			worlds,
			statistics,
			generated_at: new Date().toISOString(),
			cache_expires: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
		};

		// Cache the response
		cache.set(CACHE_KEY, responseData, 300); // 5 minutes TTL

		return json({
			success: true,
			data: responseData
		} satisfies WorldsListResponse);

	} catch (err) {
		console.error('Error in worlds API:', err);
		
		return error(500, 'Failed to load worlds');
	}
};

export const HEAD: RequestHandler = async ({ url }) => {
	// Same logic as GET but without body
	try {
		const refresh = url.searchParams.get('refresh') === 'true';
		
		if (!refresh && cache.has(CACHE_KEY)) {
			return new Response(null, {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=300'
				}
			});
		}

		// Check if we can scan the directory
		await scanner.scanAllWorlds();
		
		return new Response(null, {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});

	} catch (err) {
		return new Response(null, { status: 500 });
	}
};