import { SUPPORTED_EXTENSIONS } from './constants.js';

/**
 * Validate filename to prevent path traversal attacks
 */
export function validateFilename(filename: string): boolean {
	// Check for path traversal attempts
	if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		return false;
	}
	
	// Check for null bytes
	if (filename.includes('\0')) {
		return false;
	}
	
	// Check for supported extensions
	const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext => filename.endsWith(ext));
	if (!hasValidExtension) {
		return false;
	}
	
	// Check filename length
	if (filename.length > 255) {
		return false;
	}
	
	return true;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
	return input.trim().replace(/[<>\"'&]/g, '');
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): boolean {
	if (query.length > 100) return false;
	if (query.includes('<script>') || query.includes('javascript:')) return false;
	return true;
}