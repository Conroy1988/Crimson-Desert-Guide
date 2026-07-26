# Cloudflare Workers Preview Deployment

Cloudflare Workers Builds remains connected to `Conroy1988/Crimson-Desert-Guide` for branch previews and the legacy Worker mirror.

## Canonical production

The canonical guide now lives inside the TKB Gaming game hierarchy:

- **Public hierarchy:** TKB Gaming → Games → Crimson Desert → Game Guides
- **Public URL:** `https://tkb-gaming.scot/games/crimson-desert/guides/`
- **Production host:** cPanel static hosting
- **Production branch:** `main`
- **Deployment workflow:** `.github/workflows/deploy-cpanel.yml`
- **Operator guide:** `docs/CPANEL-DEPLOYMENT.md`

Do not treat a successful Cloudflare branch preview as proof that the canonical cPanel site deployed.

## Cloudflare service

- **Legacy/mirror URL:** `https://crimson-desert-guide.dannyconroy.workers.dev/`
- **Worker name:** `crimson-desert-guide`
- **Connected repository:** `Conroy1988/Crimson-Desert-Guide`
- **Root directory:** `/`
- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Static asset directory:** `dist`
- **Node.js version:** `22.12.0`

The static-assets configuration remains in `wrangler.jsonc`. The mirror does not require the Astro Cloudflare SSR adapter, runtime bindings or application secrets.

## Deployment policy

- Pull requests must pass **Quality Gate** and **CodeQL** before merging.
- Non-production branches may continue to receive Cloudflare preview deployments.
- Canonical releases are built for the `/games/crimson-desert/guides/` base path and published to cPanel only after successful `main` CI.
- Canonical URLs, robots and sitemap references for cPanel are generated with `CD_GUIDE_SITE=https://tkb-gaming.scot` and `CD_GUIDE_BASE_PATH=/games/crimson-desert/guides/`.
- The old `https://tkb-gaming.scot/crimsondesert/` path is retained only as a permanent redirect after migration.

Cloudflare may be retired later after the custom-domain deployment has proven stable and any useful preview role has been replaced.
