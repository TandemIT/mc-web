export interface World {
	filename: string;
	displayName: string;
	size: number;
	formatted_size: string;
	modified: string;
	formatted_modified: string;
	downloads: number;
	category: string;
	group: string;
	version: string | null;
	description: string;
	tags: string[];
	download_url: string;
}

export interface Statistics {
	total_worlds: number;
	total_size: number;
	total_downloads: number;
	categories: Record<string, number>;
}