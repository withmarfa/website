# WithMarfa website

The source of [withmarfa.com](https://withmarfa.com), the site that introduces Marfa, a shared, typed data layer for your apps.

The site is built with [Astro](https://astro.build) and served from Cloudflare. For Marfa itself, see [withmarfa/marfa](https://github.com/withmarfa/marfa) and the [docs](https://docs.marfa.so).

## Develop

You need Node.js 22.22 or later and pnpm.

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:4321`. To check types and build the static files:

```bash
pnpm check
pnpm build
```

## License

[Apache License 2.0](LICENSE)
