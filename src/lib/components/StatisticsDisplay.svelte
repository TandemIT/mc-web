<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { HardDrive, Download, Package, TrendingUp } from 'lucide-svelte';
	import { statistics } from '$lib/stores/worlds.js';

	function formatBytes(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB', 'TB'];
		let size = bytes;
		let unitIndex = 0;
		
		while (size > 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}
		
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}
</script>

{#if $statistics}
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total Worlds -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Worlds</CardTitle>
				<Package class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatNumber($statistics.total_worlds)}</div>
				<p class="text-xs text-muted-foreground">
					Available for download
				</p>
			</CardContent>
		</Card>

		<!-- Total Size -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Size</CardTitle>
				<HardDrive class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatBytes($statistics.total_size)}</div>
				<p class="text-xs text-muted-foreground">
					Combined archive size
				</p>
			</CardContent>
		</Card>

		<!-- Total Downloads -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Downloads</CardTitle>
				<Download class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatNumber($statistics.total_downloads)}</div>
				<p class="text-xs text-muted-foreground">
					All-time downloads
				</p>
			</CardContent>
		</Card>

		<!-- Most Popular Category -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Popular Category</CardTitle>
				<TrendingUp class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{#if $statistics.categories}
					{@const mostPopular = Object.entries($statistics.categories)
						.filter(([key]) => key !== 'Other')
						.sort(([,a], [,b]) => b - a)[0]}
					{#if mostPopular}
						<div class="text-2xl font-bold">{mostPopular[0]}</div>
						<p class="text-xs text-muted-foreground">
							{formatNumber(mostPopular[1])} worlds
						</p>
					{:else}
						<div class="text-2xl font-bold">-</div>
						<p class="text-xs text-muted-foreground">No data</p>
					{/if}
				{:else}
					<div class="text-2xl font-bold">-</div>
					<p class="text-xs text-muted-foreground">No data</p>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Category Breakdown -->
	<Card class="mt-6">
		<CardHeader>
			<CardTitle>Category Breakdown</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-2">
				{#each Object.entries($statistics.categories) as [category, count]}
					{#if count > 0}
						<Badge variant="outline" class="text-sm">
							{category}: {formatNumber(count)}
						</Badge>
					{/if}
				{/each}
			</div>
		</CardContent>
	</Card>
{/if}