const env = require("../../config/env");
const { escapeHtml, sanitizeUrl } = require("../utils/sanitize");

const brand = Object.freeze({
  name: "OpportunityX",
  primary: "#2563eb",
  primaryDark: "#1e40af",
  accent: "#14b8a6",
  ink: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  surface: "#f8fafc",
});

const absoluteClientUrl = (path = "/") => {
  const root = String(env.clientUrl || "http://localhost:5173").replace(/\/$/, "");
  return `${root}${path.startsWith("/") ? path : `/${path}`}`;
};

const logoMarkup = () => `
  <div style="display:inline-flex;align-items:center;gap:10px;">
    <div style="width:42px;height:42px;border-radius:10px;background:${brand.primary};color:#ffffff;font-weight:800;font-size:18px;line-height:42px;text-align:center;">OX</div>
    <div style="font-size:22px;line-height:1.2;font-weight:800;color:${brand.ink};">${brand.name}</div>
  </div>`;

const ctaMarkup = (cta) => {
  if (!cta?.url || !cta?.label) return "";
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0;">
      <tr>
        <td style="border-radius:8px;background:${brand.primary};">
          <a href="${sanitizeUrl(cta.url)}" style="display:inline-block;padding:13px 22px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:8px;">${escapeHtml(cta.label)}</a>
        </td>
      </tr>
    </table>`;
};

const paragraphMarkup = (paragraphs = []) =>
  paragraphs
    .filter((item) => item !== undefined && item !== null && String(item).trim())
    .map((item) => `<p style="margin:0 0 16px;color:${brand.ink};font-size:16px;line-height:1.65;">${escapeHtml(item)}</p>`)
    .join("");

const detailMarkup = (items = []) => {
  const rows = items.filter((item) => item?.label && item?.value);
  if (!rows.length) return "";
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;margin:18px 0;border:1px solid ${brand.border};border-radius:8px;border-collapse:separate;">
      ${rows.map((item) => `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid ${brand.border};color:${brand.muted};font-size:13px;width:36%;">${escapeHtml(item.label)}</td>
          <td style="padding:12px 14px;border-bottom:1px solid ${brand.border};color:${brand.ink};font-size:14px;font-weight:600;">${escapeHtml(item.value)}</td>
        </tr>`).join("")}
    </table>`;
};

const renderLayout = ({ title, preheader, greeting, paragraphs, cta, details, note }) => {
  const year = new Date().getFullYear();
  const supportEmail = env.supportEmail || "support@opportunityx.local";
  const socialLinks = [
    { label: "LinkedIn", url: env.socialLinks.linkedin || absoluteClientUrl("/") },
    { label: "X", url: env.socialLinks.x || absoluteClientUrl("/") },
    { label: "Privacy", url: env.privacyUrl || absoluteClientUrl("/privacy") },
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.surface};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader || title)}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;background:${brand.surface};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid ${brand.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 18px;border-bottom:4px solid ${brand.primary};">
              ${logoMarkup()}
            </td>
          </tr>
          <tr>
            <td style="padding:30px 28px 12px;">
              <h1 style="margin:0 0 18px;color:${brand.ink};font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
              <p style="margin:0 0 18px;color:${brand.ink};font-size:16px;line-height:1.65;">${escapeHtml(greeting || "Hello,")}</p>
              ${paragraphMarkup(paragraphs)}
              ${detailMarkup(details)}
              ${ctaMarkup(cta)}
              ${note ? `<p style="margin:20px 0 0;color:${brand.muted};font-size:13px;line-height:1.55;">${escapeHtml(note)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px;background:#f9fafb;border-top:1px solid ${brand.border};">
              <p style="margin:0 0 10px;color:${brand.muted};font-size:13px;line-height:1.55;">Need help? Contact ${escapeHtml(supportEmail)}. We will never ask for your password or SMTP credentials by email.</p>
              <p style="margin:0 0 10px;color:${brand.muted};font-size:13px;line-height:1.55;">${socialLinks.map((link) => `<a href="${sanitizeUrl(link.url)}" style="color:${brand.primaryDark};text-decoration:none;">${escapeHtml(link.label)}</a>`).join(" &middot; ")}</p>
              <p style="margin:0;color:${brand.muted};font-size:12px;line-height:1.5;">Privacy matters at OpportunityX. Only expected account, application, recruiter, and admin updates are sent. &copy; ${year} OpportunityX.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  absoluteClientUrl,
  brand,
  renderLayout,
};
