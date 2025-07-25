/**
 * Cache Service - In-memory caching with TTL
 */

import { config } from '$lib/config.js';

interface CacheEntry<T> {
	data: T;
	expiresAt: number;
	createdAt: number;
}

export class CacheService {
	private cache = new Map<string, CacheEntry<any>>();
	private defaultTTL: number;
	private maxSize: number;

	constructor(defaultTTL?: number, maxSize?: number) {
		this.defaultTTL = (defaultTTL || config.cache.duration) * 1000; // Convert to milliseconds
		this.maxSize = maxSize || config.cache.maxSize;
	}

	/**
	 * Get item from cache
	 */
	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		
		if (!entry) {
			return null;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set item in cache
	 */
	set<T>(key: string, data: T, ttl?: number): void {
		// Clean up expired entries if cache is getting full
		if (this.cache.size >= this.maxSize) {
			this.cleanup();
		}

		// If still at max size, remove oldest entry
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.getOldestKey();
			if (oldestKey) {
				this.cache.delete(oldestKey);
			}
		}

		const expiresAt = Date.now() + (ttl ? ttl * 1000 : this.defaultTTL);
		
		this.cache.set(key, {
			data,
			expiresAt,
			createdAt: Date.now()
		});
	}

	/**
	 * Check if key exists and is not expired
	 */
	has(key: string): boolean {
		const entry = this.cache.get(key);
		
		if (!entry) {
			return false;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Delete item from cache
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats(): {
		size: number;
		maxSize: number;
		hitRate: number;
		entries: Array<{ key: string; expiresAt: number; createdAt: number }>;
	} {
		const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
			key,
			expiresAt: entry.expiresAt,
			createdAt: entry.createdAt
		}));

		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			hitRate: 0, // Would need to track hits/misses for this
			entries
		};
	}

	/**
	 * Clean up expired entries
	 */
	private cleanup(): void {
		const now = Date.now();
		const expiredKeys: string[] = [];

		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				expiredKeys.push(key);
			}
		}

		for (const key of expiredKeys) {
			this.cache.delete(key);
		}
	}

	/**
	 * Get the oldest cache entry key
	 */
	private getOldestKey(): string | null {
		let oldestKey: string | null = null;
		let oldestTime = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.createdAt < oldestTime) {
				oldestTime = entry.createdAt;
				oldestKey = key;
			}
		}

		return oldestKey;
	}

	/**
	 * Get cache entry info
	 */
	getEntryInfo(key: string): {
		exists: boolean;
		expiresAt?: number;
		createdAt?: number;
		ttl?: number;
	} {
		const entry = this.cache.get(key);
		
		if (!entry) {
			return { exists: false };
		}

		return {
			exists: true,
			expiresAt: entry.expiresAt,
			createdAt: entry.createdAt,
			ttl: Math.max(0, entry.expiresAt - Date.now())
		};
	}
}

// Global cache instance
export const cache = new CacheService();