/**
 * TypeScript interfaces for Minecraft world data
 */

export interface World {
	filename: string;
	displayName: string;
	size: number;
	formatted_size: string;
	modified: string;
	formatted_modified: string;
	downloads: number;
	category: WorldCategory;
	group: string;
	version?: string;
	description: string;
	tags: string[];
	download_url: string;
}

export type WorldCategory = 
	| 'All The Mods'
	| 'Create'
	| 'Stoneblock'
	| 'Tekkit'
	| 'SkyFactory'
	| 'Project Architect'
	| 'Other';

export interface WorldStatistics {
	total_worlds: number;
	total_size: number;
	total_downloads: number;
	categories: Record<WorldCategory, number>;
}

export interface WorldFilter {
	search: string;
	category: WorldCategory | 'all';
	sortBy: 'name' | 'size' | 'date' | 'downloads';
	sortOrder: 'asc' | 'desc';
}

export interface WorldListState {
	worlds: World[];
	filteredWorlds: World[];
	filter: WorldFilter;
	loading: boolean;
	error: string | null;
	viewMode: 'grid' | 'list';
	groupByCategory: boolean;
}