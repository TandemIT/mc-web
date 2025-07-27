import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const downloads = sqliteTable('downloads', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	filename: text('filename').notNull().unique(),
	count: integer('count').notNull().default(0),
	firstDownload: integer('first_download', { mode: 'timestamp' }).notNull(),
	lastDownload: integer('last_download', { mode: 'timestamp' }).notNull(),
});

export const downloadLogs = sqliteTable('download_logs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	filename: text('filename').notNull(),
	timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'), // Optional for rate limiting
	userAgent: text('user_agent'), // Optional for analytics
});