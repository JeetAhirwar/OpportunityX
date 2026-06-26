class ProviderError extends Error {
  constructor(message, category = "provider_unavailable", statusCode = 503) {
    super(message);
    this.name = "ProviderError";
    this.category = category;
    this.statusCode = statusCode;
  }
}

const classifyProviderError = (status, message = "") => {
  const text = String(message).toLowerCase();
  if (status === 401 || status === 403 || /invalid api key|api key not valid|unauthorized|permission/.test(text)) return "invalid_key";
  if (status === 429 || /quota|rate limit|too many requests|resource_exhausted/.test(text)) return "quota_or_rate_limit";
  if (status >= 500 || /unavailable|overloaded|timeout|network|fetch failed/.test(text)) return "provider_unavailable";
  if (/model.*not.*found|model.*unavailable|unsupported model/.test(text)) return "model_unavailable";
  return "provider_error";
};

const parseProviderJson = async (response) => response.json().catch(() => ({}));

module.exports = {
  ProviderError,
  classifyProviderError,
  parseProviderJson,
};
