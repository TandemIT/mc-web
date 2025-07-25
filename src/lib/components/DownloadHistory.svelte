<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { 
		History, 
		Download, 
		Calendar, 
		FileText, 
		Search, 
		Trash2, 
		ExternalLink,
		Filter,
		Clock
	} from 'lucide-svelte';
	import type { World } from '$lib/types/world.js';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	interface DownloadRecord {
		id: string;
		worldName: string;
		worldFilename: string;
		category: string;
		downloadedAt: Date;
		fileSize: string;
		status: 'completed' | 'failed' | 'cancelled';
		downloadPath?: string;
		duration?: number; // in milliseconds
	}

	// State
	let downloadHistory = $state<DownloadRecord[]>([]);
	let filteredHistory = $state<DownloadRecord[]>([]);
	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'completed' | 'failed' | 'cancelled'>('all');
	let sortBy = $state<'date' | 'name' | 'size'>('date');
	let sortOrder = $state<'asc' | 'desc'>('desc');

	// Load download history from localStorage
	function loadDownloadHistory(): DownloadRecord[] {
		try {
			const saved = localStorage.getItem('downloadHistory');
			if (saved) {
				const parsed = JSON.parse(saved);
				return parsed.map((record: any) => ({
					...record,
					downloadedAt: new Date(record.downloadedAt)
				}));
			}
		} catch (error) {
			console.error('Failed to load download history:', error);
		}
		return [];
	}

	// Save download history to localStorage
	function saveDownloadHistory(history: DownloadRecord[]) {
		try {
			localStorage.setItem('downloadHistory', JSON.stringify(history));
		} catch (error) {
			console.error('Failed to save download history:', error);
		}
	}

	// Add a download record (called from external components)
	export function addDownloadRecord(world: World, status: 'completed' | 'failed' | 'cancelled', downloadPath?: string, duration?: number) {
		const record: DownloadRecord = {
			id: crypto.randomUUID(),
			worldName: world.displayName,
			worldFilename: world.filename,
			category: world.category,
			downloadedAt: new Date(),
			fileSize: world.formatted_size,
			status,
			downloadPath,
			duration
		};

		downloadHistory = [record, ...downloadHistory];
		saveDownloadHistory(downloadHistory);
		applyFilters();
	}

	// Clear all history
	function clearHistory() {
		if (confirm('Are you sure you want to clear all download history? This action cannot be undone.')) {
			downloadHistory = [];
			filteredHistory = [];
			saveDownloadHistory([]);
		}
	}

	// Delete specific record
	function deleteRecord(id: string) {
		downloadHistory = downloadHistory.filter(record => record.id !== id);
		saveDownloadHistory(downloadHistory);
		applyFilters();
	}

	// Apply filters and sorting
	function applyFilters() {
		let filtered = [...downloadHistory];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(record =>
				record.worldName.toLowerCase().includes(query) ||
				record.category.toLowerCase().includes(query) ||
				record.worldFilename.toLowerCase().includes(query)
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(record => record.status === statusFilter);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case 'date':
					comparison = a.downloadedAt.getTime() - b.downloadedAt.getTime();
					break;
				case 'name':
					comparison = a.worldName.localeCompare(b.worldName);
					break;
				case 'size':
					// Simple size comparison (would need proper parsing for accuracy)
					comparison = a.fileSize.localeCompare(b.fileSize);
					break;
			}

			return sortOrder === 'asc' ? comparison : -comparison;
		});

		filteredHistory = filtered;
	}

	// Format duration
	function formatDuration(ms?: number): string {
		if (!ms) return 'Unknown';
		
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}

	// Format relative time
	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		
		return date.toLocaleDateString();
	}

	// Get status badge variant
	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'completed': return 'default';
			case 'failed': return 'destructive';
			case 'cancelled': return 'secondary';
			default: return 'secondary';
		}
	}

	// React to filter changes
	$effect(() => {
		searchQuery;
		statusFilter;
		sortBy;
		sortOrder;
		applyFilters();
	});

	// Load history on mount
	onMount(() => {
		downloadHistory = loadDownloadHistory();
		applyFilters();
	});
</script>

<!-- Modal Backdrop -->
<div 
	class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
	onclick={onClose}
	role="dialog"
	aria-modal="true"
	aria-labelledby="history-title"
	tabindex="-1"
>
	<!-- Modal Content -->
	<Card 
		class="w-full max-w-6xl max-h-[90vh] overflow-hidden"
		onclick={(e) => e.stopPropagation()}
	>
		<CardHeader class="border-b">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<History class="h-6 w-6" />
					<div>
						<CardTitle id="history-title">Download History</CardTitle>
						<CardDescription>
							View and manage your world download history
						</CardDescription>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={onClose}>
					×
				</Button>
			</div>
		</CardHeader>

		<CardContent class="p-6">
			<!-- Filters and Controls -->
			<div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
				<!-- Search -->
				<div class="relative flex-1 max-w-sm">
					<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search downloads..."
						class="pl-10"
						bind:value={searchQuery}
					/>
				</div>

				<!-- Filters -->
				<div class="flex gap-2">
					<Select bind:value={statusFilter}>
						<SelectTrigger class="w-32">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>

					<Select bind:value={sortBy}>
						<SelectTrigger class="w-32">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date">Date</SelectItem>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="size">Size</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						size="sm"
						onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
					>
						{sortOrder === 'asc' ? '↑' : '↓'}
					</Button>

					<Button
						variant="outline"
						size="sm"
						onclick={clearHistory}
						disabled={downloadHistory.length === 0}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<!-- History List -->
			<div class="max-h-[calc(90vh-300px)] overflow-y-auto">
				{#if filteredHistory.length === 0}
					<div class="text-center py-12">
						<History class="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
						<h3 class="text-lg font-medium mb-2">No download history</h3>
						<p class="text-muted-foreground">
							{downloadHistory.length === 0 
								? 'Your download history will appear here once you start downloading worlds.'
								: 'No downloads match your current filters.'}
						</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each filteredHistory as record (record.id)}
							<div class="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
								<!-- Status Icon -->
								<div class="flex-shrink-0">
									{#if record.status === 'completed'}
										<div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
											<Download class="h-4 w-4 text-green-600 dark:text-green-400" />
										</div>
									{:else if record.status === 'failed'}
										<div class="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
											<ExternalLink class="h-4 w-4 text-red-600 dark:text-red-400" />
										</div>
									{:else}
										<div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
											<Clock class="h-4 w-4 text-gray-600 dark:text-gray-400" />
										</div>
									{/if}
								</div>

								<!-- Download Info -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<h4 class="font-medium truncate">{record.worldName}</h4>
										<Badge variant={getStatusVariant(record.status)} class="text-xs">
											{record.status}
										</Badge>
									</div>
									<div class="flex items-center gap-4 text-sm text-muted-foreground">
										<span class="flex items-center gap-1">
											<FileText class="h-3 w-3" />
											{record.category}
										</span>
										<span>{record.fileSize}</span>
										{#if record.duration}
											<span class="flex items-center gap-1">
												<Clock class="h-3 w-3" />
												{formatDuration(record.duration)}
											</span>
										{/if}
									</div>
								</div>

								<!-- Date and Actions -->
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<div class="text-right">
										<div class="flex items-center gap-1">
											<Calendar class="h-3 w-3" />
											{formatRelativeTime(record.downloadedAt)}
										</div>
										<div class="text-xs">
											{record.downloadedAt.toLocaleString()}
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => deleteRecord(record.id)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</CardContent>

		<!-- Footer -->
		<div class="flex items-center justify-between p-6 border-t bg-muted/50">
			<div class="text-sm text-muted-foreground">
				{filteredHistory.length} of {downloadHistory.length} downloads
			</div>
			<Button onclick={onClose}>
				Close
			</Button>
		</div>
	</Card>
</div>