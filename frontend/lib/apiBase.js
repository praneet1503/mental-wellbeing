export function getApiBase() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000';

  // Next.js env vars are string-substituted at build time; keep this small and deterministic.
  let base = String(raw).trim();

  // Remove trailing slashes to avoid accidental double-slashes when building URLs.
  base = base.replace(/\/+$/, '');

  // If the scheme is missing, default to https (safer for deployed backends).
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  // Fly backends typically redirect http -> https; redirects break CORS preflights.
  if (/^http:\/\//i.test(base) && /\.fly\.dev\b/i.test(base)) {
    base = base.replace(/^http:\/\//i, 'https://');
  }

  return base;
}
