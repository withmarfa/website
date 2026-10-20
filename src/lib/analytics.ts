import type { PostHogConfig } from 'posthog-js';

/**
 * Page views and unhandled errors to the "Marfa (Sites)" PostHog project,
 * which the docs and status sites also report to, and nothing else.
 *
 * The options match the docs site's (withmarfa/docs, `src/lib/analytics.ts`),
 * where each is explained. In short: no cookies and no storage of any kind, so
 * the site needs no consent banner; no person profiles; no autocapture,
 * replay, surveys or flags. Cookieless mode also has to be on in the PostHog
 * project, or events arrive and are dropped.
 */
const OPTIONS: Partial<PostHogConfig> = {
  api_host: 'https://eu.i.posthog.com',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-08-30',

  autocapture: false,
  capture_heatmaps: false,
  capture_dead_clicks: false,
  capture_performance: false,
  disable_session_recording: true,
  disable_surveys: true,
  disable_web_experiments: true,
  advanced_disable_feature_flags: true,

  capture_pageview: true,
  capture_pageleave: true,
  capture_exceptions: {
    capture_unhandled_errors: true,
    capture_unhandled_rejections: true,
    capture_console_errors: false,
  },

  person_profiles: 'never',
  cookieless_mode: 'always',
  persistence: 'memory',
};

/**
 * Loads PostHog once the page has loaded and the browser is idle, in its own
 * chunk, so the SDK never delays the page. A build without a key loads
 * nothing, and a failed load changes nothing on the page.
 */
export function loadAnalytics(): void {
  const key = import.meta.env.PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const start = () => {
    import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(key, OPTIONS);
        posthog.register({ site: 'website' });
      })
      .catch(() => {});
  };

  const whenIdle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 3000 }) : setTimeout(start, 1);

  if (document.readyState === 'complete') whenIdle();
  else addEventListener('load', whenIdle, { once: true });
}
