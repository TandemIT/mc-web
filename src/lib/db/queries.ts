import { db } from './database.js';
import { downloads, downloadLogs } from './schema.js';
import { eq, sql } from 'drizzle-orm';

export async function incrementDownload(filename: string, ipAddress?: string, userAgent?: string) {
	await db.transaction(async (tx) => {
		// Insert or update download count
		await tx.insert(downloads)
			.values({
				filename,
				count: 1,
				firstDownload: new Date(),
				lastDownload: new Date(),
			})
			.onConflictDoUpdate({
				target: downloads.filename,
				set: {
					count: sql`${downloads.count} + 1`,
					lastDownload: new Date(),
				},
			});

		// Log the download
		await tx.insert(downloadLogs).values({
			filename,
			timestamp: new Date(),
			ipAddress,
			userAgent,
		});
	});
}

export async function getDownloadStats() {
	return await db.select({
		filename: downloads.filename,
		count: downloads.count,
		lastDownload: downloads.lastDownload,
	}).from(downloads);
}

export async function getTotalDownloads(): Promise<number> {
	const result = await db.select({
		total: sql<number>`sum(${downloads.count})`
	}).from(downloads);
	
	return result[0]?.total ?? 0;
}