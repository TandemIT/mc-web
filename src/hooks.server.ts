/**
 * Server-side hooks for security and middleware
 */

import type { Handle } from '@sveltejs/kit';
import { rateLimiter } from '$lib/server/rate-limit.js';
import { config } from '$lib/config.js';

export const handle: Handle = async ({ event, resolve }) => {
	// Get client IP for rate limiting
	const clientIP = event.getClientAddress();
	
	// Apply rate limiting to API routes
	if (event.url.pathname.startsWith('/api/')) {
		const rateLimit = rateLimiter.isAllowed(clientIP);
		
		if (!rateLimit.allowed) {
			return new Response(
				JSON.stringify({
					error: 'Rate limit exceeded',
					message: 'Too many requests. Please try again later.',
					resetTime: rateLimit.resetTime
				}),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'X-RateLimit-Limit': rateLimit.limit.toString(),
						'X-RateLimit-Remaining': rateLimit.remaining.toString(),
						'X-RateLimit-Reset': rateLimit.resetTime.toString(),
						'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
					}
				}
			);
		}

		// Add rate limit headers to successful responses
		const response = await resolve(event);
		
		response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
		response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
		response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
		
		return response;
	}

	// Add security headers to all responses
	const response = await resolve(event);
	
	// Security headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'SAMEORIGIN');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	
	// CORS headers for API routes
	if (event.url.pathname.startsWith('/api/')) {
		const origin = event.request.headers.get('origin');
		const allowedOrigins = [
			config.security.corsOrigin,
			'http://localhost:3000',
			'http://localhost:5173', // Vite dev server
			'https://localhost:3000'
		];
		
		if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
			response.headers.set('Access-Control-Allow-Origin', origin);
		} else {
			response.headers.set('Access-Control-Allow-Origin', config.security.corsOrigin);
		}
		
		response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
		response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
	}
	
	return response;
};