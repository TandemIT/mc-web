import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './database.js';

export async function runMigrations() {
	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('✅ Database migrations completed');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	}
}