<script lang="ts">
	import { onMount } from 'svelte';
	import { worldActions, statistics } from '$lib/stores/worlds.js';
	import StatisticsDisplay from '$lib/components/StatisticsDisplay.svelte';
	import SearchAndFilter from '$lib/components/SearchAndFilter.svelte';
	import VirtualizedWorldList from '$lib/components/VirtualizedWorldList.svelte';
	import BulkDownload from '$lib/components/BulkDownload.svelte';

	onMount(() => {
		worldActions.loadWorlds();
	});
</script>

<svelte:head>
	<title>Minecraft World Archiver</title>
	<meta name="description" content="Download and explore Minecraft worlds from our archive" />
</svelte:head>

<div class="container mx-auto px-4 py-8 space-y-8">
	<!-- Hero Section -->
	<div class="text-center space-y-4">
		<h1 class="text-4xl font-bold tracking-tight">
			Minecraft World Archiver
		</h1>
		<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
			Explore and download our collection of Minecraft worlds. From modded adventures to creative builds, 
			find the perfect world for your next gaming session.
		</p>
	</div>

	<!-- Statistics -->
	<StatisticsDisplay />

	<!-- Bulk Download -->
	{#if $statistics && $statistics.total_worlds > 0}
		<BulkDownload />
	{/if}

	<!-- Search and Filter -->
	<SearchAndFilter />

	<!-- World List -->
	<VirtualizedWorldList />
</div>
