/**
 * Application configuration with validation
 */

import { env } from '$env/dynamic/private';

export interface AppConfig {
	worldsDir: string;
	nodeEnv: string;
	port: number;
	cache: {
		duration: number;
		maxSize: number;
	};
	rateLimit: {
		window: number;
		maxRequests: number;
	};
	security: {
		corsOrigin: string;
	};
	logging: {
		level: string;
	};
}

function validateConfig(): AppConfig {
	const config: AppConfig = {
		worldsDir: env.WORLDS_DIR || '/app/worlds',
		nodeEnv: env.NODE_ENV || 'development',
		port: parseInt(env.PORT || '3000', 10),
		cache: {
			duration: parseInt(env.CACHE_DURATION || '300', 10),
			maxSize: parseInt(env.CACHE_MAX_SIZE || '100', 10)
		},
		rateLimit: {
			window: parseInt(env.RATE_LIMIT_WINDOW || '3600', 10),
			maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
		},
		security: {
			corsOrigin: env.CORS_ORIGIN || 'http://localhost:3000'
		},
		logging: {
			level: env.LOG_LEVEL || 'info'
		}
	};

	// Validate required fields
	if (!config.worldsDir) {
		throw new Error('WORLDS_DIR environment variable is required');
	}

	if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
		throw new Error('PORT must be a valid port number between 1 and 65535');
	}

	return config;
}

export const config = validateConfig();