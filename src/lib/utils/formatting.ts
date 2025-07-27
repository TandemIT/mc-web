/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date to human readable format
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Create display name from filename
 */
export function createDisplayName(filename: string): string {
	// Remove extension
	const nameWithoutExt = filename.replace(/\.(tar\.xz|zip|tar\.gz)$/, '');
	
	// Split by double underscore to separate world name
	const parts = nameWithoutExt.split('__');
	const worldName = parts[1] || 'default';
	
	// Capitalize and format
	return worldName.charAt(0).toUpperCase() + worldName.slice(1).replace(/_/g, ' ');
}

/**
 * Create description from filename parts
 */
export function createDescription(category: string, group: string, version: string | null): string {
	const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
	const groupName = group.replace(/_/g, ' ');
	
	if (version) {
		return `${categoryName} - ${groupName} (${version})`;
	}
	
	return `${categoryName} - ${groupName}`;
}