// In-memory fixed-window rate limiter. Right for a single self-hosted Node
// process; if the app is ever scaled to several instances, swap the Map for
// Redis (same interface).

const buckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = Date.now();

/** Returns true if the request is allowed. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
    lastSweep = now;
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}
