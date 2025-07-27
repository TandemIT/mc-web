import { initializeDatabase } from '$lib/db/init.js';

// Initialize database on server startup
let initialized = false;

export async function handle({ event, resolve }) {
	if (!initialized) {
		try {
			await initializeDatabase();
			initialized = true;
		} catch (error) {
			console.error('Failed to initialize database:', error);
			// Continue anyway - the app might still work for read-only operations
		}
	}

	return resolve(event);
}