<script lang="ts">
	import { toasts } from '$lib/stores/toast.js';
	import Toast from './Toast.svelte';
</script>

<!-- Toast Container -->
{#if $toasts.length > 0}
	<div 
		class="fixed top-4 right-4 z-50 flex flex-col gap-2"
		aria-label="Notifications"
		role="region"
	>
		{#each $toasts as toast (toast.id)}
			<Toast {toast} />
		{/each}
	</div>
{/if}