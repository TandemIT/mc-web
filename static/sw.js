// Service Worker for Minecraft World Archiver
// Provides offline functionality and caching

const CACHE_NAME = 'mc-world-archiver-v1';
const STATIC_CACHE_NAME = 'mc-world-archiver-static-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
	'/',
	'/app.css',
	'/favicon.png',
	'/favicon.svg'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
	'/api/worlds',
	'/api/stats'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
	console.log('Service Worker: Installing...');
	
	event.waitUntil(
		caches.open(STATIC_CACHE_NAME)
			.then((cache) => {
				console.log('Service Worker: Caching static files');
				return cache.addAll(STATIC_FILES);
			})
			.then(() => {
				console.log('Service Worker: Static files cached');
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error('Service Worker: Failed to cache static files', error);
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('Service Worker: Activating...');
	
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
							console.log('Service Worker: Deleting old cache', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
			.then(() => {
				console.log('Service Worker: Activated');
				return self.clients.claim();
			})
	);
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);
	
	// Handle API requests
	if (url.pathname.startsWith('/api/')) {
		event.respondWith(handleApiRequest(request));
		return;
	}
	
	// Handle static files and pages
	event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
	const url = new URL(request.url);
	
	// Don't cache download requests
	if (url.pathname.startsWith('/api/download/')) {
		return fetch(request);
	}
	
	try {
		// Try network first
		const networkResponse = await fetch(request);
		
		if (networkResponse.ok) {
			// Cache successful API responses
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('Service Worker: Network failed, trying cache for', request.url);
		
		// Fall back to cache
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Return offline response for API calls
		return new Response(
			JSON.stringify({
				error: 'Offline',
				message: 'This content is not available offline'
			}),
			{
				status: 503,
				statusText: 'Service Unavailable',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
	try {
		// Try cache first
		const cachedResponse = await caches.match(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		
		// Fall back to network
		const networkResponse = await fetch(request);
		
		if (networkResponse.ok) {
			// Cache successful responses
			const cache = await caches.open(STATIC_CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}
		
		return networkResponse;
	} catch (error) {
		console.log('Service Worker: Failed to fetch', request.url);
		
		// Return offline page for navigation requests
		if (request.mode === 'navigate') {
			const offlineResponse = await caches.match('/');
			if (offlineResponse) {
				return offlineResponse;
			}
		}
		
		throw error;
	}
}

// Handle background sync for failed downloads
self.addEventListener('sync', (event) => {
	if (event.tag === 'download-retry') {
		event.waitUntil(retryFailedDownloads());
	}
});

// Retry failed downloads when back online
async function retryFailedDownloads() {
	console.log('Service Worker: Retrying failed downloads');
	
	// This would integrate with the download queue in the main app
	// For now, just log that we're ready to retry
	const clients = await self.clients.matchAll();
	clients.forEach(client => {
		client.postMessage({
			type: 'RETRY_DOWNLOADS'
		});
	});
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		
		const options = {
			body: data.body,
			icon: '/favicon.png',
			badge: '/favicon.png',
			data: data.data
		};
		
		event.waitUntil(
			self.registration.showNotification(data.title, options)
		);
	}
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	
	event.waitUntil(
		self.clients.openWindow('/')
	);
});