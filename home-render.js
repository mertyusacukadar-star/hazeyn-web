const fs = require('fs');
const path = require('path');

const HOME_FILE = path.join(__dirname, 'public', 'index.html');

function sanitizeSearchConsoleVerification(value) {
  const raw = String(value || '').trim();
  const pastedMetaContent = raw.match(/content\s*=\s*(["'])(.*?)\1/i);
  const token = pastedMetaContent ? pastedMetaContent[2] : raw;
  return token.replace(/[^A-Za-z0-9._:=+\/-]/g, '').slice(0, 256);
}

function escapeAttribute(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectSearchConsoleVerification(html, value) {
  const token = sanitizeSearchConsoleVerification(value);
  if (!token) return html;

  const tag = `<meta name="google-site-verification" content="${escapeAttribute(token)}" />`;
  const existing = /<meta\b[^>]*\bname\s*=\s*(["'])google-site-verification\1[^>]*>/i;
  if (existing.test(html)) return html.replace(existing, tag);
  return html.replace(/<\/head\s*>/i, `  ${tag}\n</head>`);
}

function renderHomePage(state) {
  const html = fs.readFileSync(HOME_FILE, 'utf8');
  return injectSearchConsoleVerification(html, state?.settings?.searchConsoleVerification);
}

module.exports = {
  injectSearchConsoleVerification,
  renderHomePage,
  sanitizeSearchConsoleVerification
};
