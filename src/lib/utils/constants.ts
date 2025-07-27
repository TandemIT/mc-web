export const WORLDS_DIRECTORY = './worlds';
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
export const RATE_LIMIT_REQUESTS = 100;
export const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export const CATEGORY_MAPPINGS: Record<string, string> = {
	'atm': 'All The Mods',
	'fts': 'Feed The Beast',
	'curs': 'CurseForge',
	'technic': 'Technic',
	'mojang': 'Vanilla',
	'tandem': 'Custom',
	'mod': 'Modded',
	'unknown': 'Unknown'
};

export const SUPPORTED_EXTENSIONS = ['.tar.xz', '.zip', '.tar.gz'];