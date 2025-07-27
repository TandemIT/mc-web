// Server-side data loading for main page
import { scanWorlds } from '$lib/server/worldScanner';

export async function load() {
  const { worlds, statistics } = await scanWorlds();
  return { worlds, statistics };
}
