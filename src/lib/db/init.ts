import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './database.js';

export async function initializeDatabase() {
	try {
		console.log('🔄 Running database migrations...');
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('✅ Database initialized successfully');
	} catch (error) {
		console.error('❌ Database initialization failed:', error);
		throw error;
	}
}