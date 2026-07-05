const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const normalizeText = (value = "") => String(value).replace(/\s+/g, " ").trim();

const sanitizeUrl = (value = "", fallback = "#") => {
  const url = String(value || "").trim();
  if (!url) return fallback;
  if (url.startsWith("/")) return escapeHtml(url);

  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return escapeHtml(parsed.toString());
    }
  } catch (_error) {
    return fallback;
  }

  return fallback;
};

const textFromHtml = (html = "") =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

module.exports = {
  escapeHtml,
  normalizeText,
  sanitizeUrl,
  textFromHtml,
};
