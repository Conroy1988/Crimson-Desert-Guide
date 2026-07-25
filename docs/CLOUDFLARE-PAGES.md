# Cloudflare Pages Setup

Create a Cloudflare Pages project connected to `Conroy1988/Crimson-Desert-Guide`.

## Build configuration

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | `22.12.0` |

No secrets are required for the static website.

## Deployment policy

- Production deployments come only from `main`.
- Pull requests receive preview deployments.
- A failed GitHub `Quality Gate` must not be merged.
- Add the final Pages URL to the repository Website field.
- Replace the placeholder `site` value in `astro.config.mjs` if Cloudflare assigns a different hostname.

## Optional custom domain

Attach a dedicated domain only after the Pages deployment, redirects, sitemap, search and mobile layout have been verified.
