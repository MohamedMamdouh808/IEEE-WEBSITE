/**
 * Normalize a link typed into an admin form.
 *
 * Admins paste things like "ieee.org", "www.ieee.org" or " https://x.com ".
 * A bare domain saved as-is would be treated as a relative path by the public
 * site, so we add the scheme here — once, at save time.
 *
 * Returns '' for anything unusable (empty, the legacy '#' placeholder, or a
 * non-http scheme such as javascript:).
 */
export function normalizeUrl(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === '#') return '';

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Reject anything with a different scheme (javascript:, data:, mailto:, ...)
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return '';

  return `https://${trimmed}`;
}

/**
 * True when the value looks like a usable web link, or is one of the "no link"
 * states — empty, or the legacy '#' placeholder some older records still hold.
 * These fields are all optional, so blank must never block a save.
 */
export function isValidUrl(value) {
  const raw = value ? String(value).trim() : '';
  if (!raw || raw === '#') return true;
  const url = normalizeUrl(raw);
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.');
  } catch {
    return false;
  }
}
