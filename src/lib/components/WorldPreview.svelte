<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { X, Download, ExternalLink } from 'lucide-svelte';
	import type { World } from '$lib/types/world.js';
	import { worldActions } from '$lib/stores/worlds.js';
	import { Package } from 'lucide-svelte';

	interface Props {
		world: World;
		onClose: () => void;
	}

	let { world, onClose }: Props = $props();
	let imageLoaded = $state(false);
	let imageError = $state(false);

	// Generate thumbnail URL (this would be implemented based on your thumbnail system)
	function getThumbnailUrl(world: World): string {
		// This assumes thumbnails are stored in a predictable location
		// You might need to adjust this based on your actual thumbnail implementation
		return `/api/thumbnails/${encodeURIComponent(world.filename)}.png`;
	}

	function handleImageLoad() {
		imageLoaded = true;
	}

	function handleImageError() {
		imageError = true;
	}

	function handleDownload() {
		worldActions.downloadWorld(world.filename);
		onClose();
	}

	// Close on Escape key
	onMount(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<!-- Modal Backdrop -->
<div 
	class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
	onclick={onClose}
	role="dialog"
	aria-modal="true"
	aria-labelledby="preview-title"
	tabindex="-1"
>
	<!-- Modal Content -->
	<Card 
		class="w-full max-w-4xl max-h-[90vh] overflow-hidden"
		onclick={(e) => e.stopPropagation()}
	>
		<CardContent class="p-0">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b">
				<div>
					<h2 id="preview-title" class="text-xl font-semibold">
						{world.displayName}
					</h2>
					<p class="text-sm text-muted-foreground mt-1">
						{world.category} • {world.formatted_size} • {world.downloads} downloads
					</p>
				</div>
				
				<Button
					variant="ghost"
					size="sm"
					onclick={onClose}
					aria-label="Close preview"
				>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<!-- Content -->
			<div class="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
				<!-- Thumbnail -->
				<div class="aspect-video bg-muted rounded-lg overflow-hidden relative">
					{#if !imageError}
						<img
							src={getThumbnailUrl(world)}
							alt="Preview of {world.displayName}"
							class="w-full h-full object-cover transition-opacity duration-300 {imageLoaded ? 'opacity-100' : 'opacity-0'}"
							onload={handleImageLoad}
							onerror={handleImageError}
						/>
					{/if}
					
					{#if !imageLoaded && !imageError}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					{/if}
					
					{#if imageError}
						<div class="absolute inset-0 flex items-center justify-center text-muted-foreground">
							<div class="text-center">
								<Package class="h-12 w-12 mx-auto mb-2 opacity-50" />
								<p class="text-sm">No preview available</p>
							</div>
						</div>
					{/if}
				</div>

				<!-- Description -->
				<div>
					<h3 class="font-medium mb-2">Description</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						{world.description}
					</p>
				</div>

				<!-- Details -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h3 class="font-medium mb-2">Details</h3>
						<dl class="space-y-1 text-sm">
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Size:</dt>
								<dd>{world.formatted_size}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Modified:</dt>
								<dd>{world.formatted_modified}</dd>
							</div>
							<div class="flex justify-between">
								<dt class="text-muted-foreground">Downloads:</dt>
								<dd>{world.downloads}</dd>
							</div>
							{#if world.version}
								<div class="flex justify-between">
									<dt class="text-muted-foreground">Version:</dt>
									<dd>{world.version}</dd>
								</div>
							{/if}
						</dl>
					</div>

					<div>
						<h3 class="font-medium mb-2">Tags</h3>
						<div class="flex flex-wrap gap-1">
							{#each world.tags as tag}
								<span class="inline-flex items-center px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
									{tag}
								</span>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between p-6 border-t bg-muted/50">
				<div class="text-sm text-muted-foreground">
					Last modified: {world.formatted_modified}
				</div>
				
				<div class="flex gap-2">
					<Button variant="outline" onclick={onClose}>
						Close
					</Button>
					<Button onclick={handleDownload}>
						<Download class="h-4 w-4 mr-2" />
						Download
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>

