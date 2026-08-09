const VIEW_WINDOW_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 50000;

const seen = new Map();

const prune = (now) => {
  if (seen.size <= MAX_ENTRIES) return;
  for (const [key, timestamp] of seen) {
    if (now - timestamp >= VIEW_WINDOW_MS) seen.delete(key);
  }
};

const recordView = (key) => {
  if (!key) return false;
  const now = Date.now();
  const last = seen.get(key);
  if (last && now - last < VIEW_WINDOW_MS) return false;
  seen.set(key, now);
  prune(now);
  return true;
};

module.exports = { recordView };
