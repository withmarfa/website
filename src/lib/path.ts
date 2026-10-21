/**
 * A page's path as people see it. Pages build to `about.html`, which
 * Cloudflare serves at `/about`, so the build-time path loses `.html` and
 * `index`.
 */
export function pagePath(url: URL): string {
  return url.pathname.replace(/(\/index)?\.html$/, '') || '/';
}
