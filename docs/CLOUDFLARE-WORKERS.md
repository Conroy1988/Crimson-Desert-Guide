# Cloudflare Workers Deployment

The production guide is deployed through Cloudflare Workers Builds from `Conroy1988/Crimson-Desert-Guide`.

## Production service

- **Public URL:** https://crimson-desert-guide.dannyconroy.workers.dev/
- **Worker name:** `crimson-desert-guide`
- **Production branch:** `main`
- **Root directory:** `/`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Static asset directory:** `dist`
- **Node.js version:** `22.12.0`

The static-assets configuration is stored in `wrangler.jsonc`. The site does not require the Astro Cloudflare SSR adapter, runtime bindings or application secrets.

## Deployment policy

- Production deployments originate only from `main`.
- Non-production branches receive preview deployments.
- Pull requests must pass `Quality Gate` and `CodeQL` before merging.
- Cloudflare automatically deploys each accepted `main` commit.
- The canonical site URL in `astro.config.mjs`, `public/robots.txt` and repository metadata must remain aligned with the production hostname.

## Custom domain

A custom domain can be attached later without changing the application architecture. When one is adopted, update all canonical URL references in the same pull request before directing search engines or users to it.
