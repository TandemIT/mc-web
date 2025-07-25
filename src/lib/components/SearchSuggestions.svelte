<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { worlds } from '$lib/stores/worlds.js';
	import { Card } from '$lib/components/ui/card';
	import { Search, Tag, Package } from 'lucide-svelte';
	import { worldSearchService } from '$lib/services/searchService.js';

	interface Props {
		query: string;
		onSelect: (suggestion: string) => void;
		onClose: () => void;
	}

	let { query, onSelect, onClose }: Props = $props();
	let selectedIndex = $state(0);

	// Generate suggestions using FlexSearch
	const suggestions = $derived(() => {
		if (!query || query.length < 2) return [];

		// Index worlds in FlexSearch
		worldSearchService.indexWorlds($worlds);

		// Get suggestions from FlexSearch service
		const flexSuggestions = worldSearchService.getSuggestions(query, 8);

		// Map to our component format
		return flexSuggestions.map(suggestion => ({
			type: suggestion.type,
			value: suggestion.value,
			label: suggestion.label,
			icon: suggestion.type === 'world' ? Package : 
				  suggestion.type === 'tag' ? Tag : Search
		}));
	});

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		const suggestionList = suggestions();
		if (suggestionList.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestionList.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (suggestionList[selectedIndex]) {
					onSelect(suggestionList[selectedIndex].value);
				}
				break;
			case 'Escape':
				event.preventDefault();
				onClose();
				break;
		}
	}

	// Reset selected index when suggestions change
	$effect(() => {
		suggestions();
		selectedIndex = 0;
	});

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if suggestions().length > 0}
	<Card 
		class="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto"
		role="listbox"
		aria-label="Search suggestions"
	>
		<div class="p-1">
			{#each suggestions() as suggestion, index}
				<button
					class="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-accent transition-colors {index === selectedIndex ? 'bg-accent' : ''}"
					onclick={() => onSelect(suggestion.value)}
					role="option"
					aria-selected={index === selectedIndex}
				>
					{#if suggestion.icon === Package}
						<Package class="h-4 w-4 text-muted-foreground" />
					{:else if suggestion.icon === Tag}
						<Tag class="h-4 w-4 text-muted-foreground" />
					{:else if suggestion.icon === Search}
						<Search class="h-4 w-4 text-muted-foreground" />
					{/if}
					<span class="flex-1 text-sm">{suggestion.label}</span>
					{#if suggestion.type === 'world'}
						<span class="text-xs text-muted-foreground">World</span>
					{:else if suggestion.type === 'tag'}
						<span class="text-xs text-muted-foreground">Tag</span>
					{:else if suggestion.type === 'category'}
						<span class="text-xs text-muted-foreground">Category</span>
					{/if}
				</button>
			{/each}
		</div>
	</Card>
{/if}