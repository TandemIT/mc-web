/**
 * FlexSearch-powered search service for Minecraft worlds
 */

import { Document } from 'flexsearch';
import type { World } from '$lib/types/world.js';

export class WorldSearchService {
	private index: any;
	private worlds: Map<string, World> = new Map();

	constructor() {
		this.index = new Document({
			id: 'id',
			index: [
				{
					field: 'displayName',
					tokenize: 'forward',
					resolution: 9
				},
				{
					field: 'description',
					tokenize: 'forward',
					resolution: 5
				},
				{
					field: 'category',
					tokenize: 'strict'
				},
				{
					field: 'tags',
					tokenize: 'forward',
					resolution: 7
				},
				{
					field: 'filename',
					tokenize: 'forward',
					resolution: 3
				}
			],
			store: true
		});
	}

	/**
	 * Index all worlds for searching
	 */
	indexWorlds(worlds: World[]): void {
		// Clear existing index
		this.worlds.clear();
		
		// Add worlds to index
		worlds.forEach(world => {
			const searchableWorld = {
				id: world.filename,
				displayName: world.displayName,
				description: world.description,
				category: world.category,
				tags: world.tags.join(' '),
				filename: world.filename
			};

			this.index.add(searchableWorld);
			this.worlds.set(world.filename, world);
		});
	}

	/**
	 * Search worlds with FlexSearch
	 */
	search(query: string, limit: number = 50): World[] {
		if (!query.trim()) {
			return Array.from(this.worlds.values());
		}

		try {
			const results = this.index.search(query, {
				limit,
				suggest: true,
				enrich: true
			});

			// FlexSearch returns results grouped by field
			const worldIds = new Set<string>();
			
			// Collect all matching IDs from different fields
			results.forEach((fieldResult: any) => {
				if (fieldResult.result) {
					fieldResult.result.forEach((item: any) => {
						worldIds.add(item.id);
					});
				}
			});

			// Convert IDs back to World objects
			return Array.from(worldIds)
				.map(id => this.worlds.get(id))
				.filter((world): world is World => world !== undefined);

		} catch (error) {
			console.error('Search error:', error);
			return Array.from(this.worlds.values());
		}
	}

	/**
	 * Get search suggestions based on partial query
	 */
	getSuggestions(query: string, limit: number = 8): Array<{
		type: 'world' | 'tag' | 'category';
		value: string;
		label: string;
		score?: number;
	}> {
		if (!query.trim() || query.length < 2) {
			return [];
		}

		const suggestions: Array<{
			type: 'world' | 'tag' | 'category';
			value: string;
			label: string;
			score?: number;
		}> = [];

		try {
			// Search for world names
			const worldResults = this.index.search(query, {
				limit: 5,
				suggest: true,
				enrich: true,
				index: ['displayName']
			});

			worldResults.forEach((fieldResult: any) => {
				if (fieldResult.result) {
					fieldResult.result.forEach((item: any) => {
						const world = this.worlds.get(item.id);
						if (world) {
							suggestions.push({
								type: 'world',
								value: world.displayName,
								label: world.displayName,
								score: item.score
							});
						}
					});
				}
			});

			// Get unique tags that match the query
			const allTags = new Set<string>();
			this.worlds.forEach(world => {
				world.tags.forEach(tag => {
					if (tag.toLowerCase().includes(query.toLowerCase())) {
						allTags.add(tag);
					}
				});
			});

			Array.from(allTags).slice(0, 3).forEach(tag => {
				suggestions.push({
					type: 'tag',
					value: tag,
					label: `Tag: ${tag}`
				});
			});

			// Get categories that match
			const categories = ['All The Mods', 'Create', 'Stoneblock', 'Tekkit', 'SkyFactory', 'Project Architect', 'Other'];
			categories
				.filter(category => category.toLowerCase().includes(query.toLowerCase()))
				.slice(0, 2)
				.forEach(category => {
					suggestions.push({
						type: 'category',
						value: category,
						label: `Category: ${category}`
					});
				});

			// Sort by relevance (score) and limit results
			return suggestions
				.sort((a, b) => (b.score || 0) - (a.score || 0))
				.slice(0, limit);

		} catch (error) {
			console.error('Suggestions error:', error);
			return [];
		}
	}

	/**
	 * Get search statistics
	 */
	getSearchStats(): {
		totalWorlds: number;
		indexedFields: string[];
	} {
		return {
			totalWorlds: this.worlds.size,
			indexedFields: ['displayName', 'description', 'category', 'tags', 'filename']
		};
	}

	/**
	 * Clear the search index
	 */
	clear(): void {
		this.worlds.clear();
		// Note: FlexSearch doesn't have a clear method, so we recreate the index
		this.index = new Document({
			id: 'id',
			index: [
				{
					field: 'displayName',
					tokenize: 'forward',
					resolution: 9
				},
				{
					field: 'description',
					tokenize: 'forward',
					resolution: 5
				},
				{
					field: 'category',
					tokenize: 'strict'
				},
				{
					field: 'tags',
					tokenize: 'forward',
					resolution: 7
				},
				{
					field: 'filename',
					tokenize: 'forward',
					resolution: 3
				}
			],
			store: true
		});
	}
}

// Export singleton instance
export const worldSearchService = new WorldSearchService();