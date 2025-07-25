<script lang="ts">
	import { fly } from 'svelte/transition';
	import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toastActions, type Toast } from '$lib/stores/toast.js';

	interface Props {
		toast: Toast;
	}

	let { toast }: Props = $props();

	function getIcon(type: Toast['type']) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return XCircle;
			case 'warning':
				return AlertTriangle;
			case 'info':
				return Info;
		}
	}

	function getStyles(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
			case 'error':
				return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
			case 'info':
				return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
		}
	}

	function getIconStyles(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'text-green-500 dark:text-green-400';
			case 'error':
				return 'text-red-500 dark:text-red-400';
			case 'warning':
				return 'text-yellow-500 dark:text-yellow-400';
			case 'info':
				return 'text-blue-500 dark:text-blue-400';
		}
	}

	const Icon = getIcon(toast.type);
</script>

<div
	class="flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md {getStyles(toast.type)}"
	transition:fly={{ x: 300, duration: 300 }}
	role="alert"
	aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
>
	<Icon class="h-5 w-5 mt-0.5 flex-shrink-0 {getIconStyles(toast.type)}" aria-hidden="true" />
	
	<div class="flex-1 min-w-0">
		<h4 class="font-medium text-sm">
			{toast.title}
		</h4>
		{#if toast.message}
			<p class="text-sm opacity-90 mt-1">
				{toast.message}
			</p>
		{/if}
	</div>

	{#if toast.dismissible}
		<Button
			variant="ghost"
			size="sm"
			class="h-6 w-6 p-0 opacity-70 hover:opacity-100"
			onclick={() => toastActions.remove(toast.id)}
			aria-label="Dismiss notification"
		>
			<X class="h-4 w-4" />
		</Button>
	{/if}
</div>