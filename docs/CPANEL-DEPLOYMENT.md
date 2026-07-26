# cPanel Production Deployment

The canonical production guide is published to:

- **Public URL:** `https://tkb-gaming.scot/crimsondesert/`
- **cPanel account:** `jtdlxqpa`
- **Document root:** `/home/jtdlxqpa/public_html/crimsondesert`
- **Source branch:** `main`
- **Generated deployment branch:** `cpanel-deploy`
- **Workflow:** `.github/workflows/deploy-cpanel.yml`

## Deployment model

1. A pull request passes **Quality Gate** and **CodeQL**.
2. The accepted change is merged into `main`.
3. `CI` validates the exact `main` commit.
4. `Publish cPanel Deployment Branch` rebuilds that exact commit for `https://tkb-gaming.scot/crimsondesert/`.
5. GitHub publishes only the compiled static site, `.cpanel.yml` and deployment metadata to `cpanel-deploy`.
6. cPanel Git Version Control pulls the generated branch into a private repository path.
7. **Deploy HEAD Commit** runs `.cpanel.yml`, verifies the protected target and publishes the site.

No Node.js build, WordPress installation, database or source checkout is required inside the public website directory.

## Initial cPanel Git setup

Wait until the GitHub workflow has created the `cpanel-deploy` branch. Then open:

**cPanel → Files → Git Version Control → Create**

Use:

- **Clone a Repository:** enabled
- **Clone URL:** `https://github.com/Conroy1988/Crimson-Desert-Guide.git`
- **Repository Path:** `repositories/crimson-desert-guide-deploy`
- **Repository Name:** `Crimson Desert Guide Deployment`

After the clone completes:

1. Open **Manage**.
2. Change the checked-out branch to `cpanel-deploy`.
3. Open **Pull or Deploy**.
4. Select **Update from Remote**.
5. Select **Deploy HEAD Commit**.

The repository checkout remains private at:

```text
/home/jtdlxqpa/repositories/crimson-desert-guide-deploy
```

The generated website is deployed to:

```text
/home/jtdlxqpa/public_html/crimsondesert
```

## Protected deployment sentinel

The live directory must contain:

```text
/home/jtdlxqpa/public_html/crimsondesert/.github-deploy-target
```

Its complete content must be:

```text
crimson-desert-guide
```

The `.cpanel.yml` deployment refuses to clean or publish unless:

- the target is exactly `/home/jtdlxqpa/public_html/crimsondesert`;
- the target directory exists;
- the deployment sentinel exists and matches;
- the generated site contains `index.html` and the Command Centre route.

The deployment excludes the sentinel from cleanup, removes stale top-level output and copies the complete generated release into the protected target.

## Routine releases

Every accepted `main` commit automatically refreshes `cpanel-deploy` after CI passes.

To publish it on the host:

1. Open **cPanel → Git Version Control**.
2. Open **Manage** for `Crimson Desert Guide Deployment`.
3. Open **Pull or Deploy**.
4. Click **Update from Remote**.
5. Click **Deploy HEAD Commit**.
6. Open `https://tkb-gaming.scot/crimsondesert/deployment.json` and confirm the commit matches the current `main` release.

This is cPanel pull deployment. cPanel does not automatically deploy a new commit merely because the remote GitHub repository changed. Automatic cPanel push deployment would require pushing directly to the cPanel-managed repository, which depends on reliable SSH access.

## Rollback

Use a normal Git revert or dedicated rollback pull request. Once the rollback reaches `main` and the generated `cpanel-deploy` branch updates:

1. Select **Update from Remote** in cPanel.
2. Select **Deploy HEAD Commit**.

Do not edit the generated branch manually, do not deploy the source `main` branch, and do not point deployment at the whole `public_html` directory.

## Retired SSH configuration

The previous SSH deployment design is not used. The GitHub `cpanel-production` environment secrets and the dedicated cPanel SSH key may be removed after this Git-based path is verified.
