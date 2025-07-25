<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon } from 'lucide-svelte';

	let theme = $state<'light' | 'dark'>('light');

	onMount(() => {
		// Check for saved theme preference or default to 'light'
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		theme = savedTheme || (prefersDark ? 'dark' : 'light');
		applyTheme(theme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('theme')) {
				theme = e.matches ? 'dark' : 'light';
				applyTheme(theme);
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});

	function applyTheme(newTheme: 'light' | 'dark') {
		const root = document.documentElement;
		
		if (newTheme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		applyTheme(theme);
	}
</script>

<Button
	variant="ghost"
	size="sm"
	onclick={toggleTheme}
	title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
	class="h-8 w-8 p-0"
>
	{#if theme === 'light'}
		<Moon class="h-4 w-4" />
	{:else}
		<Sun class="h-4 w-4" />
	{/if}
</Button>