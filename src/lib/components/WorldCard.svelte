<script lang="ts">
	import type { World } from '$lib/types/world.js';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Download, Calendar, HardDrive, TrendingUp, Eye } from 'lucide-svelte';
	import { worldActions, downloadProgress } from '$lib/stores/worlds.js';
	import WorldPreview from './WorldPreview.svelte';

	interface Props {
		world: World;
		viewMode?: 'grid' | 'list';
	}

	let { world, viewMode = 'grid' }: Props = $props();
	let showPreview = $state(false);

	function handleDownload() {
		worldActions.downloadWorld(world.filename);
	}

	const isDownloading = $derived($downloadProgress.has(world.filename));

	function getCategoryColor(category: string): string {
		const colors: Record<string, string> = {
			'All The Mods': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
			'Create': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
			'Stoneblock': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
			'Tekkit': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
			'SkyFactory': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
			'Project Architect': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
			'Other': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
		};
		return colors[category] || colors['Other'];
	}
</script>

<Card class={`transition-all duration-200 hover:shadow-lg ${viewMode === 'list' ? 'flex flex-row' : ''}`} role="article" aria-labelledby="world-title-{world.filename}">
	<CardHeader class={viewMode === 'list' ? 'flex-1' : ''}>
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				<CardTitle id="world-title-{world.filename}" class="text-lg font-semibold truncate" title={world.displayName}>
					{world.displayName}
				</CardTitle>
				<CardDescription class="mt-1">
					{world.description}
				</CardDescription>
			</div>
			<Badge class={getCategoryColor(world.category)}>
				{world.category}
			</Badge>
		</div>

		{#if world.tags.length > 0}
			<div class="flex flex-wrap gap-1 mt-2">
				{#each world.tags as tag}
					<Badge variant="outline" class="text-xs">
						{tag}
					</Badge>
				{/each}
			</div>
		{/if}
	</CardHeader>

	<CardContent class={`space-y-3 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
		<div class={`grid gap-2 text-sm text-muted-foreground ${viewMode === 'list' ? 'grid-cols-2' : 'grid-cols-1'}`}>
			<div class="flex items-center gap-2">
				<HardDrive class="h-4 w-4" />
				<span>{world.formatted_size}</span>
			</div>
			
			<div class="flex items-center gap-2">
				<Calendar class="h-4 w-4" />
				<span>{world.formatted_modified}</span>
			</div>
			
			<div class="flex items-center gap-2">
				<TrendingUp class="h-4 w-4" />
				<span>{world.downloads} downloads</span>
			</div>

			{#if world.version}
				<div class="flex items-center gap-2">
					<span class="text-xs font-mono bg-muted px-2 py-1 rounded">
						v{world.version}
					</span>
				</div>
			{/if}
		</div>

		<div class="flex gap-2">
			<Button 
				onclick={() => showPreview = true}
				variant="outline"
				class="flex-1"
				aria-label={`Preview ${world.displayName}`}
			>
				<Eye class="h-4 w-4 mr-2" aria-hidden="true" />
				Preview
			</Button>
			
			<Button 
				onclick={handleDownload}
				class="flex-1"
				variant="default"
				disabled={isDownloading}
				aria-label={`Download ${world.displayName} (${world.formatted_size})`}
				aria-describedby="world-title-{world.filename}"
			>
				<Download class="h-4 w-4 mr-2" aria-hidden="true" />
				{isDownloading ? 'Downloading...' : 'Download'}
			</Button>
		</div>
	</CardContent>
</Card>

<!-- Preview Modal -->
{#if showPreview}
	<WorldPreview {world} onClose={() => showPreview = false} />
{/if}