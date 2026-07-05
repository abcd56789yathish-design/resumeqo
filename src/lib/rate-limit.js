const rateMap = new Map();

export function rateLimit({
  windowMs = 15 * 60 * 1000,
  max = 100,
  keyFn = (req) =>
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous",
} = {}) {
  return function (request) {
    const now = Date.now();
    const key = keyFn(request);

    const timestamps = rateMap.get(key) || [];
    const recent = timestamps.filter((ts) => now - ts < windowMs);
    const remaining = Math.max(0, max - recent.length);

    if (recent.length >= max) {
      return {
        limited: true,
        remaining: 0,
        reset: recent[0] + windowMs,
        limit: max,
      };
    }

    recent.push(now);
    rateMap.set(key, recent);

    return {
      limited: false,
      remaining,
      reset: now + windowMs,
      limit: max,
    };
  };
}
