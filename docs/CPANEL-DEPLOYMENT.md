# cPanel Production Deployment

The Crimson Desert application is the **Game Guides** area inside the TKB Gaming game hierarchy:

```text
TKB Gaming
└── Games
    └── Crimson Desert
        ├── Game Guides
        ├── Mods
        ├── Tools
        ├── News
        └── Media
```

Canonical production details:

- **Public URL:** `https://tkb-gaming.scot/games/crimson-desert/guides/`
- **cPanel account:** `jtdlxqpa`
- **Document root:** `/home/jtdlxqpa/public_html/games/crimson-desert/guides`
- **Legacy URL:** `https://tkb-gaming.scot/crimsondesert/`
- **Source branch:** `main`
- **Generated deployment branch:** `cpanel-deploy`
- **Workflow:** `.github/workflows/deploy-cpanel.yml`

The parent paths are reserved for the TKB portal:

- `/games/` — game directory
- `/games/crimson-desert/` — Crimson Desert game hub
- `/games/crimson-desert/guides/` — this standalone Astro guide

## Deployment model

1. A pull request passes **Quality Gate** and **CodeQL**.
2. The accepted change is merged into `main`.
3. `CI` validates the exact `main` commit.
4. `Publish cPanel Deployment Branch` rebuilds that exact commit for the canonical Game Guides URL.
5. GitHub publishes only the compiled static site, redirect payload, `.cpanel.yml` and deployment metadata to `cpanel-deploy`.
6. cPanel Git Version Control pulls the generated branch into a private repository path.
7. **Deploy HEAD Commit** validates both protected targets, publishes the new guide, then replaces the old `/crimsondesert/` files with a permanent redirect.

No Node.js build, WordPress installation, database or source checkout is required inside the guide directory.

## Initial host preparation

Keep the existing `/home/jtdlxqpa/public_html/crimsondesert` site in place until the first structured deployment.

In **cPanel → File Manager** create:

```text
/home/jtdlxqpa/public_html/games
/home/jtdlxqpa/public_html/games/crimson-desert
/home/jtdlxqpa/public_html/games/crimson-desert/guides
```

Inside the new `guides` directory create:

```text
.github-deploy-target
```

Its complete content must be:

```text
crimson-desert-guide
```

The old directory must retain its existing marker:

```text
/home/jtdlxqpa/public_html/crimsondesert/.github-deploy-target
```

Do not manually delete the old guide files. The first successful cPanel deployment cleans them only after the new target has been copied and validated.

## Initial cPanel Git setup

Wait until the GitHub workflow has refreshed the `cpanel-deploy` branch. Then open:

**cPanel → Files → Git Version Control → Create**

Use:

- **Clone a Repository:** enabled
- **Clone URL:** `https://github.com/Conroy1988/Crimson-Desert-Guide.git`
- **Repository Path:** `repositories/game-guides/crimson-desert-guide-deploy`
- **Repository Name:** `Crimson Desert Guide Deployment`

After the clone completes:

1. Open **Manage**.
2. Change the checked-out branch to `cpanel-deploy`.
3. Open **Pull or Deploy**.
4. Select **Update from Remote**.
5. Select **Deploy HEAD Commit**.

The repository checkout remains private at:

```text
/home/jtdlxqpa/repositories/game-guides/crimson-desert-guide-deploy
```

The generated website is deployed to:

```text
/home/jtdlxqpa/public_html/games/crimson-desert/guides
```

## Protected targets

The structured guide target and legacy redirect target must both contain a matching sentinel:

```text
/home/jtdlxqpa/public_html/games/crimson-desert/guides/.github-deploy-target
/home/jtdlxqpa/public_html/crimsondesert/.github-deploy-target
```

Complete content for both:

```text
crimson-desert-guide
```

The `.cpanel.yml` deployment refuses to clean or publish unless:

- both target directories exist;
- both deployment sentinels exist and match;
- the generated site contains `index.html` and the Command Centre route;
- the generated legacy payload contains the permanent redirect files.

Deployment order:

1. Clean the new guide target while preserving its sentinel.
2. Copy and validate the structured guide release.
3. Clean the old `/crimsondesert/` target while preserving its sentinel.
4. Install a `301` redirect and HTML fallback from the old URL to the new hierarchy.

This order prevents the currently live guide from being removed before the replacement is present on disk.

## WordPress portal integration

The future TKB portal will own:

- `https://tkb-gaming.scot/games/`
- `https://tkb-gaming.scot/games/crimson-desert/`

Because the physical `games/crimson-desert/guides` directory exists, the portal must explicitly route the two parent landing pages while leaving the `guides` directory untouched. The TKB WordPress theme or core plugin should provide those parent page routes and link the **Game Guides** card to the standalone Astro application.

Do not install WordPress core inside `public_html/games` or inside the guide target.

## Verification

After the first deployment open:

1. `https://tkb-gaming.scot/games/crimson-desert/guides/`
2. `https://tkb-gaming.scot/games/crimson-desert/guides/command-centre/`
3. `https://tkb-gaming.scot/games/crimson-desert/guides/deployment.json`
4. `https://tkb-gaming.scot/crimsondesert/`

The first three must load from the structured guide path. The legacy URL must redirect permanently to the new guide URL.

## Routine releases

Every accepted `main` commit automatically refreshes `cpanel-deploy` after CI passes.

To publish it on the host:

1. Open **cPanel → Git Version Control**.
2. Open **Manage** for `Crimson Desert Guide Deployment`.
3. Open **Pull or Deploy**.
4. Click **Update from Remote**.
5. Click **Deploy HEAD Commit**.
6. Open the canonical `deployment.json` and confirm the commit matches the current `main` release.

This is cPanel pull deployment. cPanel does not automatically deploy a new commit merely because the remote GitHub repository changed. Automatic cPanel push deployment would require reliable SSH access.

## Rollback

Use a normal Git revert or dedicated rollback pull request. Once the rollback reaches `main` and the generated `cpanel-deploy` branch updates:

1. Select **Update from Remote** in cPanel.
2. Select **Deploy HEAD Commit**.

Do not edit the generated branch manually, do not deploy the source `main` branch, and do not point deployment at the whole `public_html` directory.

## Retired SSH configuration

The previous SSH deployment design is not used. The GitHub `cpanel-production` environment secrets and the dedicated cPanel SSH key may be removed after this Git-based path is verified.
