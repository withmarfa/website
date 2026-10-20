// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://withmarfa.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // `about.html` rather than `about/index.html`, so Cloudflare serves
    // `/about` without redirecting to `/about/`.
    format: 'file',
    // Stylesheets as files rather than inline, so the Content Security Policy
    // in `public/_headers` needs no 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
});
