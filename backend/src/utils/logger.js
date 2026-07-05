const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const configuredLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
const activeLevel = levels[configuredLevel] ?? levels.info;

const redact = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === "production" ? undefined : value.stack,
    };
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => (
    /password|token|secret|authorization|cookie/i.test(key) ? [key, "[redacted]"] : [key, item]
  )));
};

const write = (level, message, meta) => {
  if (levels[level] > activeLevel) return;
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
};

module.exports = {
  info: (message, meta) => write("info", message, meta),
  warn: (message, meta) => write("warn", message, meta),
  error: (message, meta) => write("error", message, meta),
  debug: (message, meta) => write("debug", message, meta),
};
