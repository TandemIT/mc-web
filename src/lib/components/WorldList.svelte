<script lang="ts">
	import { sortedWorlds, viewMode, loading, error } from '$lib/stores/worlds.js';
	import { worldActions } from '$lib/stores/worlds.js';
	import WorldCard from './WorldCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { AlertCircle, RefreshCw, Package } from 'lucide-svelte';

	// Loading skeleton component
	function createLoadingSkeleton() {
		return Array.from({ length: 6 }, (_, i) => i);
	}
</script>

<div class="space-y-4">
	<!-- Error Display -->
	{#if $error}
		<Card class="border-destructive">
			<CardContent class="flex items-center gap-3 p-4">
				<AlertCircle class="h-5 w-5 text-destructive" />
				<div class="flex-1">
					<p class="text-sm font-medium text-destructive">Error loading worlds</p>
					<p class="text-sm text-muted-foreground">{$error}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						worldActions.clearError();
						worldActions.loadWorlds();
					}}
				>
					<RefreshCw class="mr-2 h-4 w-4" />
					Retry
				</Button>
			</CardContent>
		</Card>
	{/if}

	<!-- Loading State -->
	{#if $loading}
		<div class="grid gap-4 {$viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}">
			{#each createLoadingSkeleton() as _}
				<Card>
					<CardContent class="p-6">
						<div class="space-y-3">
							<Skeleton class="h-4 w-3/4" />
							<Skeleton class="h-3 w-full" />
							<Skeleton class="h-3 w-2/3" />
							<div class="flex gap-2 pt-2">
								<Skeleton class="h-6 w-16" />
								<Skeleton class="h-6 w-20" />
							</div>
							<div class="flex justify-between pt-2">
								<Skeleton class="h-8 w-24" />
								<Skeleton class="h-8 w-16" />
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if $sortedWorlds.length === 0}
		<!-- Empty State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12">
				<Package class="h-12 w-12 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold mb-2">No worlds found</h3>
				<p class="text-muted-foreground text-center mb-4">
					{#if $error}
						There was an error loading the worlds.
					{:else}
						Try adjusting your search or filter criteria.
					{/if}
				</p>
				<Button
					variant="outline"
					onclick={() => worldActions.loadWorlds()}
				>
					<RefreshCw class="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- World List/Grid -->
		<div class="grid gap-4 {$viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}">
			{#each $sortedWorlds as world (world.filename)}
				<WorldCard {world} viewMode={$viewMode} />
			{/each}
		</div>

		<!-- Results Summary -->
		<div class="flex items-center justify-center pt-4">
			<p class="text-sm text-muted-foreground">
				Showing {$sortedWorlds.length} world{$sortedWorlds.length !== 1 ? 's' : ''}
			</p>
		</div>
	{/if}
</div>