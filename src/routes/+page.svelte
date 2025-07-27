<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { WorldsResponse } from '$lib/types/api.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let worldsData = $state<WorldsResponse | null>(null);
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let selectedCategory = $state('all');

	// Watch for URL parameter changes
	$effect(() => {
		const urlSearch = $page.url.searchParams.get('search') || '';
		const urlCategory = $page.url.searchParams.get('category') || 'all';
		
		if (urlSearch !== searchQuery) {
			searchQuery = urlSearch;
		}
		if (urlCategory !== selectedCategory) {
			selectedCategory = urlCategory;
		}
	});

	async function loadWorlds() {
		loading = true;
		error = '';
		
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.set('search', searchQuery);
			if (selectedCategory !== 'all') params.set('category', selectedCategory);
			
			const response = await fetch(`/api/worlds?${params}`);
			const data = await response.json();
			
			if (data.success) {
				worldsData = data;
			} else {
				error = data.message || 'Failed to load worlds';
			}
		} catch (err) {
			error = 'Network error occurred';
			console.error('Error loading worlds:', err);
		} finally {
			loading = false;
		}
	}

	function updateURL() {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		if (selectedCategory !== 'all') params.set('category', selectedCategory);
		
		const url = params.toString() ? `/?${params}` : '/';
		goto(url, { replaceState: true });
	}

	function handleSearch() {
		updateURL();
		loadWorlds();
	}

	function handleCategoryChange(category: string) {
		selectedCategory = category;
		updateURL();
		loadWorlds();
	}

	onMount(() => {
		loadWorlds();
	});

	// Get unique categories from statistics
	const categories = $derived(worldsData?.statistics.categories ? Object.keys(worldsData.statistics.categories) : []);
</script>

<svelte:head>
	<title>Minecraft Worlds - Tandem Server</title>
	<meta name="description" content="Download Minecraft worlds from Tandem server" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<!-- Header -->
	<div class="text-center mb-8">
		<h1 class="text-4xl font-bold mb-4">Minecraft Worlds</h1>
		<p class="text-muted-foreground text-lg">
			Download worlds from the Tandem Minecraft server
		</p>
	</div>

	<!-- Statistics -->
	{#if worldsData?.statistics}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-sm font-medium">Total Worlds</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{worldsData.statistics.total_worlds}</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-sm font-medium">Total Downloads</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">{worldsData.statistics.total_downloads}</div>
				</CardContent>
			</Card>
			
			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-sm font-medium">Total Size</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{(worldsData.statistics.total_size / (1024 * 1024 * 1024)).toFixed(1)} GB
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}

	<!-- Search and Filters -->
	<div class="flex flex-col md:flex-row gap-4 mb-6">
		<div class="flex-1">
			<Input
				type="text"
				placeholder="Search worlds..."
				bind:value={searchQuery}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						handleSearch();
					}
				}}
			/>
		</div>
		<Button onclick={handleSearch}>Search</Button>
	</div>

	<!-- Category Filter -->
	<div class="flex flex-wrap gap-2 mb-6">
		<Button
			variant={selectedCategory === 'all' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleCategoryChange('all')}
		>
			All Categories
		</Button>
		{#each categories as category}
			<Button
				variant={selectedCategory === category ? 'default' : 'outline'}
				size="sm"
				onclick={() => handleCategoryChange(category)}
			>
				{category} ({worldsData?.statistics.categories[category] || 0})
			</Button>
		{/each}
	</div>

	<!-- Loading State -->
	{#if loading}
		<div class="text-center py-8">
			<div class="text-lg">Loading worlds...</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if error}
		<div class="text-center py-8">
			<div class="text-red-500 text-lg">{error}</div>
			<Button class="mt-4" onclick={loadWorlds}>Try Again</Button>
		</div>
	{/if}

	<!-- Worlds Grid -->
	{#if worldsData?.worlds && !loading}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each worldsData.worlds as world}
				<Card class="hover:shadow-lg transition-shadow">
					<CardHeader>
						<CardTitle class="text-lg">{world.displayName}</CardTitle>
						<CardDescription>{world.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3">
							<!-- Tags -->
							<div class="flex flex-wrap gap-1">
								{#each world.tags as tag}
									<Badge variant="secondary" class="text-xs">{tag}</Badge>
								{/each}
							</div>
							
							<!-- File Info -->
							<div class="text-sm text-muted-foreground space-y-1">
								<div>Size: {world.formatted_size}</div>
								<div>Modified: {world.formatted_modified}</div>
								<div>Downloads: {world.downloads}</div>
							</div>
							
							<!-- Download Button -->
							<Button class="w-full" onclick={() => window.open(world.download_url)}>
								Download
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		<!-- No Results -->
		{#if worldsData.worlds.length === 0}
			<div class="text-center py-8">
				<div class="text-lg text-muted-foreground">No worlds found</div>
				<p class="text-sm text-muted-foreground mt-2">
					Try adjusting your search or category filter
				</p>
			</div>
		{/if}
	{/if}

	<!-- Footer -->
	<footer class="text-center text-sm text-muted-foreground mt-12 pt-8 border-t">
		<p>Tandem Minecraft Server - World Archive</p>
		{#if worldsData?.generated_at}
			<p class="mt-1">Last updated: {new Date(worldsData.generated_at).toLocaleString()}</p>
		{/if}
	</footer>
</div>