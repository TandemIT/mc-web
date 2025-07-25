/**
 * Rate Limiting Service
 */

import { config } from '$lib/config.js';

interface RateLimitEntry {
	requests: number[];
	windowStart: number;
}

export class RateLimiter {
	private clients = new Map<string, RateLimitEntry>();
	private windowMs: number;
	private maxRequests: number;

	constructor(windowMs?: number, maxRequests?: number) {
		this.windowMs = (windowMs || config.rateLimit.window) * 1000; // Convert to milliseconds
		this.maxRequests = maxRequests || config.rateLimit.maxRequests;
	}

	/**
	 * Check if request is allowed for the given client
	 */
	isAllowed(clientId: string): {
		allowed: boolean;
		remaining: number;
		resetTime: number;
		limit: number;
	} {
		const now = Date.now();
		const windowStart = now - this.windowMs;

		// Get or create client entry
		let entry = this.clients.get(clientId);
		if (!entry) {
			entry = {
				requests: [],
				windowStart: now
			};
			this.clients.set(clientId, entry);
		}

		// Clean up old requests outside the current window
		entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

		// Check if limit is exceeded
		const allowed = entry.requests.length < this.maxRequests;
		
		if (allowed) {
			entry.requests.push(now);
		}

		// Calculate reset time (when the oldest request will expire)
		const oldestRequest = entry.requests[0];
		const resetTime = oldestRequest ? oldestRequest + this.windowMs : now + this.windowMs;

		return {
			allowed,
			remaining: Math.max(0, this.maxRequests - entry.requests.length),
			resetTime,
			limit: this.maxRequests
		};
	}

	/**
	 * Clean up expired entries
	 */
	cleanup(): void {
		const now = Date.now();
		const cutoff = now - this.windowMs;

		for (const [clientId, entry] of this.clients.entries()) {
			// Remove requests outside the window
			entry.requests = entry.requests.filter(timestamp => timestamp > cutoff);
			
			// Remove client if no recent requests
			if (entry.requests.length === 0 && entry.windowStart < cutoff) {
				this.clients.delete(clientId);
			}
		}
	}

	/**
	 * Get rate limit stats
	 */
	getStats(): {
		totalClients: number;
		windowMs: number;
		maxRequests: number;
	} {
		return {
			totalClients: this.clients.size,
			windowMs: this.windowMs,
			maxRequests: this.maxRequests
		};
	}
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => {
	rateLimiter.cleanup();
}, 5 * 60 * 1000);