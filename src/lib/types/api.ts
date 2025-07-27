import type { World, Statistics } from './world.js';

export interface WorldsResponse {
	success: boolean;
	worlds: World[];
	statistics: Statistics;
	generated_at: string;
	cache_expires: string;
}

export interface ApiError {
	success: false;
	error: string;
	message: string;
}