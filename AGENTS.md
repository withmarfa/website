# WithMarfa website

The source of the public site at `withmarfa.com`: Astro, built to static files and served as a Cloudflare Worker with static assets only. GitHub Actions builds every pull request and deploys `main`.

## Conventions

- TypeScript and ESM. pnpm with the committed lockfile, on Node 22.22 or later (`.node-version`), which Astro 7 requires.
- American English in code, comments and commits. Words on the page follow the Writing section of Apple's Human Interface Guidelines; the README follows the Google developer documentation style guide.
- Conventional Commits with a scope, such as `feat(home):` or `fix(analytics):`. Work reaches `main` only through a pull request, one logical change each, squash merged.
- Make worktrees in `.claude/worktrees/` (`git worktree add .claude/worktrees/<name> -b <branch> origin/main`). Once merged, remove the worktree and its local branch, and run `git pull --ff-only` on `main`.
- This repository is public. Commit no key, token, account ID, internal hostname or personal path.
- A comment says only what the code cannot: the reason, the constraint or the trade-off.
- `CLAUDE.md` is a symlink to this file. Edit this file, never the link.

## Layout

- `src/pages/`: one file per page. `404.astro` is what Cloudflare serves for a missing path.
- `src/layouts/Base.astro`: the document head, the column and the footer, used by every page.
- `src/components/`: the footer and the question that opens.
- `src/styles/global.css`: the color tokens, shared with the docs site's canvas and text colors. Light and dark follow the system; there is no toggle.
- `src/lib/analytics.ts`: PostHog, loaded after the page.
- `public/`: copied as is. `_headers` sets the security headers and the Content Security Policy.

## Commands

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm check      # astro check, the type check
pnpm build      # static files in dist/
pnpm preview    # build, then serve dist/ with Wrangler as Cloudflare will
```

## Deploying

- **Merging to `main` deploys.** The `CI` workflow's `Build and check` job runs `pnpm run check` and `pnpm run build` on every pull request and push; it is the required check. On `main`, the `Deploy to withmarfa.com` job deploys exactly the files that job built with `wrangler deploy`, then fails unless withmarfa.com serves them.
- The workflow uses the `CLOUDFLARE_API_TOKEN` secret, a token that can only deploy Workers in the WithMarfa account and manage Worker routes on withmarfa.com, and the `CLOUDFLARE_ACCOUNT_ID` and `POSTHOG_PROJECT_KEY_SITES` variables. Never commit any of them.
- `withmarfa.com` is the Worker's custom domain (`wrangler.jsonc`). Redirects from `www.withmarfa.com`, `marfa.so` and `www.marfa.so` are zone redirect rules in Cloudflare, not in this repository, because `_redirects` cannot change the host.
- A build without `PUBLIC_POSTHOG_KEY` sends nothing, which is what a fork or a local build gets.
- The fallback when the workflow cannot deploy is `pnpm run build && pnpm exec wrangler deploy` from a shell authenticated to the WithMarfa account.

## Analytics

- Page views, page leaves and unhandled errors go to the PostHog project the docs and status sites use, with `site: 'website'` on every event. Nothing else is captured.
- Cookieless: no cookies, no local or session storage, no person profiles, so the site needs no consent banner. Cookieless mode must stay on in the PostHog project, or events are dropped.
- The SDK loads by dynamic import after the page has loaded, in its own chunk.

## Code Review Rules

Report only a problem you can show: name the page, input or step, and what goes wrong.

- **Untrue about Marfa.** Flag a claim about what Marfa does, where it runs or what it costs that withmarfa/marfa or docs.marfa.so contradicts. Never say Marfa Cloud is free.
- **Deploy weakened.** Flag a `paths` filter on `ci.yml`, a renamed `Build and check` job, or a deploy that no longer checks the live site.
- **Analytics grown.** Flag an option in `src/lib/analytics.ts` that turns on autocapture, replay, surveys, flags, cookies or storage, or a static import of `posthog-js`.
- **Policy broken.** Flag an inline script or style, or a new third-party origin, that `public/_headers` does not allow.
- **Private detail committed.** Flag a token, key, account ID, internal hostname or personal path in a tracked file.
- **Stale instructions.** Flag a change that leaves this file, the README or a comment untrue, and fix it in the same pull request.
