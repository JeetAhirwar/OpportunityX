const buckets = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 100, keyPrefix = "global" } = {}) => (req, res, next) => {
  const now = Date.now();
  const identity = req.user?._id || req.ip || "anonymous";
  const key = `${keyPrefix}:${identity}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > max) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  return next();
};

module.exports = rateLimit;
module.exports.rateLimit = rateLimit;
