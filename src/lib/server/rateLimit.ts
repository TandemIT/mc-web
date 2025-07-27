// Simple rate limiting middleware (in-memory, for demo)
const downloadAttempts: Record<string, number> = {};
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 10;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (!downloadAttempts[ip]) downloadAttempts[ip] = 0;
  downloadAttempts[ip]++;
  if (downloadAttempts[ip] > MAX_ATTEMPTS) {
    return false;
  }
  setTimeout(() => { downloadAttempts[ip] = 0; }, WINDOW_MS);
  return true;
}
