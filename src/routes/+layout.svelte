<script lang="ts">
	import '../app.css';
	import { Button } from '$lib/components/ui/button';
	import { Package, Github, ExternalLink } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SkipNavigation from '$lib/components/SkipNavigation.svelte';
	import ServiceWorkerRegistration from '$lib/components/ServiceWorkerRegistration.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background flex flex-col">
	<SkipNavigation />
	<ServiceWorkerRegistration />
	
	<!-- Header -->
	<header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Package class="h-6 w-6 text-primary" />
				<span class="font-bold text-lg">MC World Archiver</span>
			</div>
			
			<nav class="flex items-center gap-4">
				<a href="/" class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
					<Package class="h-4 w-4" />
					Worlds
				</a>
				
				<a 
					href="https://github.com/tandemIT/mc-web" 
					target="_blank" 
					rel="noopener noreferrer"
					class="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
				>
					<Github class="h-4 w-4" />
					GitHub
					<ExternalLink class="h-3 w-3" />
				</a>
				
				<ThemeToggle />
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main id="main-content" class="flex-1" tabindex="-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t bg-muted/50 mt-auto">
		<div class="container mx-auto px-4 py-6">
			<div class="flex flex-col md:flex-row items-center justify-between gap-4">
				<div class="text-sm text-muted-foreground">
					<p>&copy; 2024 Minecraft World Archiver. Built with SvelteKit.</p>
				</div>
				
				<div class="flex items-center gap-4 text-sm text-muted-foreground">
					<span>Powered by</span>
					<div class="flex items-center gap-2">
						<img src="/favicon.svg" alt="SvelteKit" class="h-4 w-4" />
						<span>SvelteKit</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
	
	<!-- Toast Notifications -->
	<ToastContainer />
</div>