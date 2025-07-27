// Data migration from downloads.json (if exists)
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { insertDownloadStats } from '../db/queries';

export async function migrateDownloadsJson() {
  const filePath = join(process.cwd(), 'downloads.json');
  try {
    const data = await readFile(filePath, 'utf-8');
    const downloads = JSON.parse(data);
    for (const [filename, count] of Object.entries(downloads)) {
      await insertDownloadStats(filename, count as number);
    }
    return true;
  } catch (err) {
    // File not found or error
    return false;
  }
}
