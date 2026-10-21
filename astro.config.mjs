// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://withmarfa.com',
  output: 'static',
  // Astro 7's default ('jsx') drops a line break before an inline element,
  // so prose wrapped in the source loses its space ("The<a>About</a>").
  // `true` compresses without changing what renders.
  compressHTML: true,
  trailingSlash: 'never',
  build: {
    // `about.html` rather than `about/index.html`, so Cloudflare serves
    // `/about` without redirecting to `/about/`.
    format: 'file',
    // Stylesheets as files rather than inline, so the Content Security Policy
    // in `public/_headers` needs no 'unsafe-inline'.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Astro inlines a script smaller than this limit, and the Content
      // Security Policy blocks inline scripts, so every script stays a file.
      assetsInlineLimit: 0,
    },
  },
});
