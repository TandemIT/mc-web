<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Filter, Grid, List, SortAsc, SortDesc, Settings, History } from 'lucide-svelte';
	import { searchQuery, selectedCategory, sortBy, sortOrder, viewMode, statistics } from '$lib/stores/worlds.js';
	import { worldActions } from '$lib/stores/worlds.js';
	import type { WorldCategory } from '$lib/types/world.js';
	import SearchSuggestions from './SearchSuggestions.svelte';
	import ArchiveNamingSettings from './ArchiveNamingSettings.svelte';
	import DownloadHistory from './DownloadHistory.svelte';

	// Categories for filtering
	const categories = [
		{ value: 'all', label: 'All Categories' },
		{ value: 'All The Mods', label: 'All The Mods' },
		{ value: 'Create', label: 'Create' },
		{ value: 'Stoneblock', label: 'Stoneblock' },
		{ value: 'Tekkit', label: 'Tekkit' },
		{ value: 'SkyFactory', label: 'SkyFactory' },
		{ value: 'Project Architect', label: 'Project Architect' },
		{ value: 'Other', label: 'Other' }
	];

	// Sort options
	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'size', label: 'Size' },
		{ value: 'modified', label: 'Modified' },
		{ value: 'downloads', label: 'Downloads' }
	];

	// Search suggestions state
	let showSuggestions = $state(false);
	let searchInputElement: any;

	// Modal states
	let showArchiveSettings = $state(false);
	let showDownloadHistory = $state(false);

	function handleCategoryClick(category: string) {
		worldActions.setCategory(category);
	}

	function handleSortClick(field: 'name' | 'size' | 'modified' | 'downloads') {
		const newOrder = $sortBy === field && $sortOrder === 'asc' ? 'desc' : 'asc';
		worldActions.setSorting(field, newOrder);
	}

	function handleViewModeToggle() {
		worldActions.setViewMode($viewMode === 'grid' ? 'list' : 'grid');
	}

	function handleSearchInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		worldActions.setSearchQuery(target.value);
		showSuggestions = target.value.length >= 2;
	}

	function handleSearchFocus() {
		if ($searchQuery.length >= 2) {
			showSuggestions = true;
		}
	}

	function handleSearchBlur() {
		// Delay hiding suggestions to allow for clicks
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}

	function handleSuggestionSelect(suggestion: string) {
		worldActions.setSearchQuery(suggestion);
		showSuggestions = false;
		searchInputElement?.focus();
	}
</script>

<div class="space-y-4">
	<!-- Search Bar -->
	<div class="relative">
		<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
		<Input
			bind:this={searchInputElement}
			type="text"
			placeholder="Search worlds by name, description, or tags..."
			class="pl-10"
			bind:value={$searchQuery}
			oninput={handleSearchInput}
			onfocus={handleSearchFocus}
			onblur={handleSearchBlur}
			aria-label="Search worlds"
			role="searchbox"
			aria-expanded={showSuggestions}
			aria-haspopup="listbox"
		/>

		<!-- Search Suggestions -->
		{#if showSuggestions}
			<SearchSuggestions
				query={$searchQuery}
				onSelect={handleSuggestionSelect}
				onClose={() => showSuggestions = false}
			/>
		{/if}
	</div>

	<!-- Filters and Controls -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<!-- Category Filters -->
		<div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
			{#each categories as category}
				<Badge
					variant={$selectedCategory === category.value ? 'default' : 'outline'}
					class="cursor-pointer transition-colors hover:bg-primary/10"
					onclick={() => handleCategoryClick(category.value)}
				>
					{category.label}
					{#if $statistics && category.value !== 'all'}
						<span class="ml-1 text-xs">
							({$statistics.categories[category.value as WorldCategory] || 0})
						</span>
					{/if}
				</Badge>
			{/each}
		</div>

		<!-- Sort and View Controls -->
		<div class="flex items-center gap-2">
			<!-- Sort Controls -->
			<div class="flex items-center gap-1" role="group" aria-label="Sort options">
				{#each sortOptions as option}
					<Button
						variant={$sortBy === option.value ? 'default' : 'outline'}
						size="sm"
						class="h-8"
						onclick={() => handleSortClick(option.value as 'name' | 'size' | 'modified' | 'downloads')}
						aria-label={`Sort by ${option.label} ${$sortBy === option.value ? ($sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
						aria-pressed={$sortBy === option.value}
					>
						{option.label}
						{#if $sortBy === option.value}
							{#if $sortOrder === 'asc'}
								<SortAsc class="ml-1 h-3 w-3" />
							{:else}
								<SortDesc class="ml-1 h-3 w-3" />
							{/if}
						{/if}
					</Button>
				{/each}
			</div>

			<!-- Additional Controls -->
			<div class="flex items-center gap-2">
				<!-- Archive Settings -->
				<Button
					variant="outline"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={() => showArchiveSettings = true}
					title="Archive naming settings"
				>
					<Settings class="h-4 w-4" />
				</Button>

				<!-- Download History -->
				<Button
					variant="outline"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={() => showDownloadHistory = true}
					title="Download history"
				>
					<History class="h-4 w-4" />
				</Button>

				<!-- View Mode Toggle -->
				<Button
					variant="outline"
					size="sm"
					class="h-8 w-8 p-0"
					onclick={handleViewModeToggle}
					title={$viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
				>
					{#if $viewMode === 'grid'}
						<List class="h-4 w-4" />
					{:else}
						<Grid class="h-4 w-4" />
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>

<!-- Modals -->
{#if showArchiveSettings}
	<ArchiveNamingSettings 
		onClose={() => showArchiveSettings = false}
		sampleWorld={$statistics ? {
			displayName: "Example World",
			filename: "example_world.zip",
			category: "All The Mods",
			formatted_size: "125 MB",
			version: "1.20.1",
			downloads: 42
		} : undefined}
	/>
{/if}

{#if showDownloadHistory}
	<DownloadHistory onClose={() => showDownloadHistory = false} />
{/if}