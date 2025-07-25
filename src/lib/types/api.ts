/**
 * TypeScript interfaces for API responses
 */

import type { World, WorldStatistics } from './world.js';

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface WorldsListResponse extends ApiResponse {
	data: {
		worlds: World[];
		statistics: WorldStatistics;
		generated_at: string;
		cache_expires: string;
	};
}

export interface WorldInfoResponse extends ApiResponse {
	data: {
		world: World;
	};
}

export interface StatsResponse extends ApiResponse {
	data: {
		statistics: WorldStatistics;
	};
}

export interface DownloadResponse {
	success: boolean;
	filename?: string;
	size?: number;
	error?: string;
}

export interface CacheInfo {
	isValid: boolean;
	expiresAt: string;
	lastUpdated: string;
}

export interface RateLimitInfo {
	remaining: number;
	resetTime: number;
	limit: number;
}