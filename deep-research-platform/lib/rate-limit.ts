const WINDOW_MS = 60_000;

type LimitName = "sessions" | "steps";

type Bucket = {
  tokens: number;
  lastRefill: number;
};

const LIMITS: Record<LimitName, number> = {
  sessions: 5,
  steps: 3,
};

const buckets = new Map<string, Bucket>();

function key(userId: string, limit: LimitName): string {
  return `${userId}:${limit}`;
}

export function enforceRateLimit(userId: string, limit: LimitName) {
  const now = Date.now();
  const bucketKey = key(userId, limit);
  const max = LIMITS[limit];
  const refillPerMs = max / WINDOW_MS;

  const bucket = buckets.get(bucketKey) ?? { tokens: max, lastRefill: now };
  const elapsed = Math.max(0, now - bucket.lastRefill);
  const refill = elapsed * refillPerMs;
  bucket.tokens = Math.min(max, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    buckets.set(bucketKey, bucket);
    return {
      allowed: false,
      headers: {
        "X-RateLimit-Limit": String(max),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil((1 - bucket.tokens) / refillPerMs / 1000)),
      },
    };
  }

  bucket.tokens -= 1;
  buckets.set(bucketKey, bucket);

  return {
    allowed: true,
    headers: {
      "X-RateLimit-Limit": String(max),
      "X-RateLimit-Remaining": String(Math.floor(bucket.tokens)),
      "X-RateLimit-Reset": "60",
    },
  };
}
