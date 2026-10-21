import type { APIRoute } from 'astro';

/** Pages that are not for search: the 404 page and the sign-up thank-you. */
const UNLISTED = new Set(['404', 'subscribed']);

const pages = Object.keys(import.meta.glob('./*.astro'))
  .map((file) => file.slice(2, -'.astro'.length))
  .filter((name) => !UNLISTED.has(name))
  .map((name) => (name === 'index' ? '/' : `/${name}`))
  .sort();

export const GET: APIRoute = ({ site }) => {
  const urls = pages.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
