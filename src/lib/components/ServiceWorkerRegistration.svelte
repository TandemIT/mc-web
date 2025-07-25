<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let swRegistration: ServiceWorkerRegistration | null = null;
	let isOnline = $state(true);
	let updateAvailable = $state(false);

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			registerServiceWorker();
			setupOnlineOfflineHandlers();
		}
	});

	async function registerServiceWorker() {
		try {
			swRegistration = await navigator.serviceWorker.register('/sw.js');
			console.log('Service Worker registered successfully');

			// Check for updates
			swRegistration.addEventListener('updatefound', () => {
				const newWorker = swRegistration?.installing;
				if (newWorker) {
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							updateAvailable = true;
						}
					});
				}
			});

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data.type === 'RETRY_DOWNLOADS') {
					// Handle retry downloads when back online
					console.log('Service Worker: Ready to retry downloads');
				}
			});

		} catch (error) {
			console.error('Service Worker registration failed:', error);
		}
	}

	function setupOnlineOfflineHandlers() {
		isOnline = navigator.onLine;

		window.addEventListener('online', () => {
			isOnline = true;
			console.log('App: Back online');
		});

		window.addEventListener('offline', () => {
			isOnline = false;
			console.log('App: Gone offline');
		});
	}

	function updateApp() {
		if (swRegistration?.waiting) {
			swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
			window.location.reload();
		}
	}
</script>

<!-- Offline Indicator -->
{#if !isOnline}
	<div class="fixed top-16 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium z-40">
		You are currently offline. Some features may not be available.
	</div>
{/if}

<!-- Update Available Notification -->
{#if updateAvailable}
	<div class="fixed top-16 left-0 right-0 bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium z-40">
		A new version is available.
		<button 
			onclick={updateApp}
			class="ml-2 underline hover:no-underline"
		>
			Update now
		</button>
	</div>
{/if}