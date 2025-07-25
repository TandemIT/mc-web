<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Download, Package } from 'lucide-svelte';
	import { worldActions, downloadProgress, statistics } from '$lib/stores/worlds.js';

	$: isBulkDownloading = $downloadProgress.has('all');

	function handleBulkDownload() {
		worldActions.downloadAllWorlds();
	}

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
</script>

<Card class="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<Package class="h-5 w-5" />
			Download All Worlds
		</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				Download all available Minecraft worlds as a single compressed archive.
				{#if $statistics}
					This includes {$statistics.total_worlds} worlds with a total size of approximately {formatBytes($statistics.total_size)}.
				{/if}
			</p>
			
			<Button
				onclick={handleBulkDownload}
				disabled={isBulkDownloading}
				class="w-full"
				size="lg"
			>
				<Download class="h-4 w-4 mr-2" />
				{isBulkDownloading ? 'Creating Archive...' : 'Download All Worlds'}
			</Button>
			
			{#if isBulkDownloading}
				<p class="text-xs text-muted-foreground text-center">
					This may take a few minutes depending on the total size...
				</p>
			{/if}
		</div>
	</CardContent>
</Card>