# `tkb-gaming.scot/crimsondesert/` migration runbook

Verified: 26 July 2026  
Current production: `https://crimson-desert-guide.dannyconroy.workers.dev/`  
Target production: `https://tkb-gaming.scot/crimsondesert/`

## Deployment model

The repository supports two deterministic build modes:

| Mode | Site | Base path | Output |
|---|---|---|---|
| Existing Worker | `https://crimson-desert-guide.dannyconroy.workers.dev` | `/` | `dist/` |
| TKB subpath | `https://tkb-gaming.scot` | `/crimsondesert/` | `dist/crimsondesert/` |

The subpath output is nested deliberately. Cloudflare can therefore receive requests such as `/crimsondesert/technical/` without stripping the prefix, while the separate TKB website remains responsible for the domain root.

## Build commands

The current root build remains unchanged:

```bash
npm run check:all
```

The repository also performs a full cross-platform subpath build and deployment smoke test:

```bash
npm run check:subpath
```

For the eventual Cloudflare production build, set these build environment variables:

```text
CD_GUIDE_SITE=https://tkb-gaming.scot
CD_GUIDE_BASE_PATH=/crimsondesert/
```

Do not set `CD_GUIDE_DIST_ROOT` in production. Its default value keeps Wrangler's asset directory at `dist/` while placing the guide inside `dist/crimsondesert/`.

## Cloudflare cutover checklist

1. Confirm `tkb-gaming.scot` is active and the root TKB website is healthy.
2. Keep the existing `workers.dev` deployment enabled as the rollback target.
3. Configure the Crimson Desert Worker/build with the two environment variables above.
4. Route only the `/crimsondesert/` path and its descendants to the guide deployment.
5. Confirm the root domain and unrelated TKB routes still resolve to the main TKB website.
6. Test the guide homepage, search, navigation, Completion Companion, Pywel Atlas, Character Mastery, Build Laboratory, manifest, favicon, sitemap and 404 behaviour.
7. Confirm canonical URLs use `https://tkb-gaming.scot/crimsondesert/`.
8. Add the guide sitemap to the root domain's authoritative `robots.txt` if the root host maintains that file.
9. Retain the previous Worker hostname until production monitoring shows a clean cutover.

## Rollback

If the subpath deployment fails:

1. remove or disable the `/crimsondesert/` route;
2. restore the root TKB site's previous routing state;
3. keep publishing the guide at the existing `workers.dev` hostname;
4. inspect the failed Cloudflare build and `npm run check:subpath` output before retrying.

No guide data, Completion Companion state format or Build Laboratory state format changes during this migration.

## Advertising boundary

Advertising is deliberately excluded from the domain cutover. Consent management, privacy disclosures, provider configuration and non-invasive placements are a separate post-migration change and must pass accessibility, performance and mobile-layout validation before release.
