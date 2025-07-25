/**
 * Svelte stores for world data management
 */

import { writable, derived } from 'svelte/store';
import type { World, WorldStatistics } from '$lib/types/world.js';
import { toastActions } from './toast.js';
import { worldSearchService } from '$lib/services/searchService.js';

// Core data stores
export const worlds = writable<World[]>([]);
export const statistics = writable<WorldStatistics | null>(null);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);

// Search and filter stores
export const searchQuery = writable<string>('');
export const selectedCategory = writable<string>('all');
export const sortBy = writable<'name' | 'size' | 'modified' | 'downloads'>('name');
export const sortOrder = writable<'asc' | 'desc'>('asc');
export const viewMode = writable<'grid' | 'list'>('grid');

// Derived stores for filtered and sorted worlds using FlexSearch
export const filteredWorlds = derived(
	[worlds, searchQuery, selectedCategory],
	([$worlds, $searchQuery, $selectedCategory]) => {
		// Index worlds in FlexSearch when worlds change
		worldSearchService.indexWorlds($worlds);

		let filtered: World[];

		// Apply search filter using FlexSearch
		if ($searchQuery.trim()) {
			filtered = worldSearchService.search($searchQuery);
		} else {
			filtered = $worlds;
		}

		// Filter by category
		if ($selectedCategory !== 'all') {
			filtered = filtered.filter(world => world.category === $selectedCategory);
		}

		return filtered;
	}
);

export const sortedWorlds = derived(
	[filteredWorlds, sortBy, sortOrder],
	([$filteredWorlds, $sortBy, $sortOrder]) => {
		const sorted = [...$filteredWorlds];

		sorted.sort((a, b) => {
			let comparison = 0;

			switch ($sortBy) {
				case 'name':
					comparison = a.displayName.localeCompare(b.displayName);
					break;
				case 'size':
					comparison = a.size - b.size;
					break;
				case 'modified':
					comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
					break;
				case 'downloads':
					comparison = a.downloads - b.downloads;
					break;
			}

			return $sortOrder === 'asc' ? comparison : -comparison;
		});

		return sorted;
	}
);

// Download progress tracking
export const downloadProgress = writable<Map<string, number>>(new Map());

// Actions
export const worldActions = {
	async loadWorlds() {
		loading.set(true);
		error.set(null);

		try {
			const response = await fetch('/api/worlds');
			if (!response.ok) {
				throw new Error(`Failed to load worlds: ${response.statusText}`);
			}

			const data = await response.json();
			worlds.set(data.worlds || []);
			statistics.set(data.statistics || null);
		} catch (err) {
			console.error('Failed to load worlds:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to load worlds';
			error.set(errorMessage);
			toastActions.error('Failed to load worlds', errorMessage);
		} finally {
			loading.set(false);
		}
	},

	async downloadWorld(filename: string) {
		try {
			// Track download progress
			downloadProgress.update(map => {
				map.set(filename, 0);
				return map;
			});

			const response = await fetch(`/api/download/${encodeURIComponent(filename)}`);
			if (!response.ok) {
				throw new Error(`Download failed: ${response.statusText}`);
			}

			// Create download link
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			// Remove from progress tracking
			downloadProgress.update(map => {
				map.delete(filename);
				return map;
			});

			// Reload worlds to update download counts
			await worldActions.loadWorlds();
			
			// Show success toast
			toastActions.success('Download started', `${filename} is being downloaded`);
		} catch (err) {
			console.error('Download failed:', err);
			const errorMessage = err instanceof Error ? err.message : 'Download failed';
			error.set(errorMessage);
			toastActions.error('Download failed', `Failed to download ${filename}: ${errorMessage}`);
			
			// Remove from progress tracking
			downloadProgress.update(map => {
				map.delete(filename);
				return map;
			});
		}
	},

	async downloadAllWorlds() {
		try {
			downloadProgress.update(map => {
				map.set('all', 0);
				return map;
			});

			const response = await fetch('/api/download/all');
			if (!response.ok) {
				throw new Error(`Bulk download failed: ${response.statusText}`);
			}

			// Create download link
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `minecraft-worlds-${new Date().toISOString().slice(0, 10)}.zip`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);

			// Remove from progress tracking
			downloadProgress.update(map => {
				map.delete('all');
				return map;
			});

			// Reload worlds to update download counts
			await worldActions.loadWorlds();
			
			// Show success toast
			toastActions.success('Bulk download started', 'All worlds are being packaged for download');
		} catch (err) {
			console.error('Bulk download failed:', err);
			const errorMessage = err instanceof Error ? err.message : 'Bulk download failed';
			error.set(errorMessage);
			toastActions.error('Bulk download failed', errorMessage);
			
			// Remove from progress tracking
			downloadProgress.update(map => {
				map.delete('all');
				return map;
			});
		}
	},

	clearError() {
		error.set(null);
	},

	setSearchQuery(query: string) {
		searchQuery.set(query);
	},

	setCategory(category: string) {
		selectedCategory.set(category);
	},

	setSorting(field: 'name' | 'size' | 'modified' | 'downloads', order: 'asc' | 'desc') {
		sortBy.set(field);
		sortOrder.set(order);
	},

	setViewMode(mode: 'grid' | 'list') {
		viewMode.set(mode);
	}
};