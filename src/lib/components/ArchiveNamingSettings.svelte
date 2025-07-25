<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Settings, Download, FileText, Calendar, Hash } from 'lucide-svelte';
	import type { World } from '$lib/types/world.js';

	interface Props {
		onClose: () => void;
		sampleWorld?: World;
	}

	let { onClose, sampleWorld }: Props = $props();

	// Archive naming settings
	let namingPattern = $state('{displayName}_{category}_{date}');
	let dateFormat = $state('YYYY-MM-DD');
	let includeVersion = $state(true);
	let includeSize = $state(false);
	let sanitizeNames = $state(true);
	let maxLength = $state(100);
	let customSeparator = $state('_');

	// Available tokens for naming patterns
	const availableTokens = [
		{ token: '{displayName}', description: 'World display name', icon: FileText },
		{ token: '{filename}', description: 'Original filename', icon: FileText },
		{ token: '{category}', description: 'World category', icon: Hash },
		{ token: '{date}', description: 'Current date', icon: Calendar },
		{ token: '{time}', description: 'Current time', icon: Calendar },
		{ token: '{version}', description: 'World version (if available)', icon: Hash },
		{ token: '{size}', description: 'File size', icon: Hash },
		{ token: '{downloads}', description: 'Download count', icon: Download }
	];

	// Generate preview of the naming pattern
	const previewName = $derived(() => {
		if (!sampleWorld) return 'preview_example_2024-01-15';

		let preview = namingPattern;
		const now = new Date();

		// Replace tokens with sample data
		preview = preview.replace('{displayName}', sampleWorld.displayName);
		preview = preview.replace('{filename}', sampleWorld.filename.replace('.zip', ''));
		preview = preview.replace('{category}', sampleWorld.category);
		preview = preview.replace('{date}', formatDate(now, dateFormat));
		preview = preview.replace('{time}', formatTime(now));
		preview = preview.replace('{version}', sampleWorld.version || 'v1.0');
		preview = preview.replace('{size}', sampleWorld.formatted_size);
		preview = preview.replace('{downloads}', sampleWorld.downloads.toString());

		// Apply sanitization if enabled
		if (sanitizeNames) {
			preview = sanitizeName(preview);
		}

		// Apply max length
		if (preview.length > maxLength) {
			preview = preview.substring(0, maxLength - 3) + '...';
		}

		return preview + '.zip';
	});

	function formatDate(date: Date, format: string): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return format
			.replace('YYYY', year.toString())
			.replace('MM', month)
			.replace('DD', day);
	}

	function formatTime(date: Date): string {
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${hours}-${minutes}`;
	}

	function sanitizeName(name: string): string {
		// Remove or replace invalid filename characters
		return name
			.replace(/[<>:"/\\|?*]/g, customSeparator)
			.replace(/\s+/g, customSeparator)
			.replace(new RegExp(`\\${customSeparator}+`, 'g'), customSeparator);
	}

	function insertToken(token: string) {
		namingPattern += token;
	}

	function resetToDefault() {
		namingPattern = '{displayName}_{category}_{date}';
		dateFormat = 'YYYY-MM-DD';
		includeVersion = true;
		includeSize = false;
		sanitizeNames = true;
		maxLength = 100;
		customSeparator = '_';
	}

	function saveSettings() {
		// Save settings to localStorage or send to backend
		const settings = {
			namingPattern,
			dateFormat,
			includeVersion,
			includeSize,
			sanitizeNames,
			maxLength,
			customSeparator
		};

		localStorage.setItem('archiveNamingSettings', JSON.stringify(settings));
		onClose();
	}

	// Load settings on mount
	function loadSettings() {
		const saved = localStorage.getItem('archiveNamingSettings');
		if (saved) {
			try {
				const settings = JSON.parse(saved);
				namingPattern = settings.namingPattern || namingPattern;
				dateFormat = settings.dateFormat || dateFormat;
				includeVersion = settings.includeVersion ?? includeVersion;
				includeSize = settings.includeSize ?? includeSize;
				sanitizeNames = settings.sanitizeNames ?? sanitizeNames;
				maxLength = settings.maxLength || maxLength;
				customSeparator = settings.customSeparator || customSeparator;
			} catch (error) {
				console.error('Failed to load archive naming settings:', error);
			}
		}
	}

	// Load settings when component mounts
	$effect(() => {
		loadSettings();
	});
</script>

<!-- Modal Backdrop -->
<div 
	class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
	onclick={onClose}
	role="dialog"
	aria-modal="true"
	aria-labelledby="settings-title"
	tabindex="-1"
>
	<!-- Modal Content -->
	<Card 
		class="w-full max-w-4xl max-h-[90vh] overflow-hidden"
		onclick={(e) => e.stopPropagation()}
	>
		<CardHeader class="border-b">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<Settings class="h-6 w-6" />
					<div>
						<CardTitle id="settings-title">Archive Naming Settings</CardTitle>
						<CardDescription>
							Customize how downloaded world archives are named
						</CardDescription>
					</div>
				</div>
				<Button variant="ghost" size="sm" onclick={onClose}>
					×
				</Button>
			</div>
		</CardHeader>

		<CardContent class="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
			<div class="space-y-6">
				<!-- Naming Pattern -->
				<div class="space-y-3">
					<Label for="naming-pattern">Naming Pattern</Label>
					<Input
						id="naming-pattern"
						bind:value={namingPattern}
						placeholder="Enter naming pattern..."
						class="font-mono"
					/>
					<p class="text-sm text-muted-foreground">
						Use tokens like {'{displayName}'}, {'{category}'}, {'{date}'} to build your pattern
					</p>
				</div>

				<!-- Available Tokens -->
				<div class="space-y-3">
					<Label>Available Tokens</Label>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						{#each availableTokens as { token, description, icon }}
							<button
								class="flex items-center gap-2 p-2 text-left rounded-md border hover:bg-accent transition-colors"
								onclick={() => insertToken(token)}
							>
								<svelte:component this={icon} class="h-4 w-4 text-muted-foreground" />
								<div class="flex-1 min-w-0">
									<div class="font-mono text-sm">{token}</div>
									<div class="text-xs text-muted-foreground truncate">{description}</div>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Date Format -->
				<div class="space-y-3">
					<Label for="date-format">Date Format</Label>
					<Select bind:value={dateFormat}>
						<SelectTrigger>
							<SelectValue placeholder="Select date format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="YYYY-MM-DD">2024-01-15 (YYYY-MM-DD)</SelectItem>
							<SelectItem value="DD-MM-YYYY">15-01-2024 (DD-MM-YYYY)</SelectItem>
							<SelectItem value="MM-DD-YYYY">01-15-2024 (MM-DD-YYYY)</SelectItem>
							<SelectItem value="YYYYMMDD">20240115 (YYYYMMDD)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<!-- Additional Options -->
				<div class="space-y-4">
					<Label>Additional Options</Label>
					
					<div class="flex items-center space-x-2">
						<Checkbox id="sanitize" bind:checked={sanitizeNames} />
						<Label for="sanitize" class="text-sm">
							Sanitize filenames (remove invalid characters)
						</Label>
					</div>

					<div class="flex items-center space-x-2">
						<Checkbox id="include-version" bind:checked={includeVersion} />
						<Label for="include-version" class="text-sm">
							Include version in filename when available
						</Label>
					</div>

					<div class="flex items-center space-x-2">
						<Checkbox id="include-size" bind:checked={includeSize} />
						<Label for="include-size" class="text-sm">
							Include file size in filename
						</Label>
					</div>
				</div>

				<!-- Advanced Settings -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="separator">Custom Separator</Label>
						<Input
							id="separator"
							bind:value={customSeparator}
							placeholder="_"
							maxlength="3"
							class="w-20"
						/>
					</div>

					<div class="space-y-2">
						<Label for="max-length">Max Length</Label>
						<Input
							id="max-length"
							type="number"
							bind:value={maxLength}
							min="20"
							max="255"
							class="w-24"
						/>
					</div>
				</div>

				<!-- Preview -->
				<div class="space-y-3">
					<Label>Preview</Label>
					<div class="p-3 bg-muted rounded-md">
						<div class="flex items-center gap-2">
							<FileText class="h-4 w-4 text-muted-foreground" />
							<code class="text-sm">{previewName}</code>
						</div>
					</div>
					{#if previewName.length > maxLength}
						<p class="text-sm text-amber-600">
							⚠️ Filename exceeds maximum length and will be truncated
						</p>
					{/if}
				</div>
			</div>
		</CardContent>

		<!-- Footer -->
		<div class="flex items-center justify-between p-6 border-t bg-muted/50">
			<Button variant="outline" onclick={resetToDefault}>
				Reset to Default
			</Button>

			<div class="flex gap-2">
				<Button variant="outline" onclick={onClose}>
					Cancel
				</Button>
				<Button onclick={saveSettings}>
					Save Settings
				</Button>
			</div>
		</div>
	</Card>
</div>