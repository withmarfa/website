interface ImportMetaEnv {
  /** The "Marfa (Sites)" PostHog project key. Unset, the site sends nothing. */
  readonly PUBLIC_POSTHOG_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
