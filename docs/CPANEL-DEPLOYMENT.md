# cPanel Production Deployment

The canonical production guide is published to:

- **Public URL:** `https://tkb-gaming.scot/crimsondesert/`
- **cPanel account:** `jtdlxqpa`
- **Document root:** `/home/jtdlxqpa/public_html/crimsondesert`
- **Source branch:** `main`
- **Workflow:** `.github/workflows/deploy-cpanel.yml`

## Deployment model

1. A pull request passes **Quality Gate** and **CodeQL**.
2. The accepted change is merged into `main`.
3. `CI` validates the exact `main` commit and produces both root and `/crimsondesert/` builds.
4. `Deploy cPanel Production` runs only after the successful `main` CI result.
5. The workflow rebuilds the exact accepted commit for `https://tkb-gaming.scot/crimsondesert/`.
6. A dedicated encrypted SSH identity uploads a compressed release to a private staging directory.
7. The remote target and sentinel are verified before `rsync --delete-delay` is permitted.
8. The workflow writes `deployment.json` and verifies the public commit after deployment.

No Node.js application, database, WordPress installation or cPanel Git checkout is required on the production host.

## Required GitHub environment

Create an environment named `cpanel-production` and restrict it to the `main` branch.

Add these environment secrets:

| Secret | Value |
|---|---|
| `CPANEL_HOST` | The SSH hostname supplied by the hosting provider |
| `CPANEL_PORT` | The SSH port supplied by the hosting provider |
| `CPANEL_USER` | `jtdlxqpa` |
| `CPANEL_SSH_PRIVATE_KEY` | The complete encrypted private key for the dedicated deployment identity |
| `CPANEL_SSH_KEY_PASSPHRASE` | The passphrase protecting that private key |
| `CPANEL_KNOWN_HOSTS` | A verified `known_hosts` entry for the exact SSH hostname and port |

Never commit or paste the private key or its passphrase into repository files, issues, pull requests, chat messages or logs.

## Dedicated SSH key

The hosting provider requires a strong passphrase for keys generated in cPanel:

1. Open **cPanel → SSH Access → Manage SSH Keys**.
2. Select **Generate a New Key**.
3. Use a clear deployment-only name such as `tkb_crimson_desert_deploy`.
4. Choose **RSA** with a **4096-bit** key size.
5. Use a strong unique passphrase and store it in the shared password manager.
6. Generate the key.
7. Open **Manage** beside the new public key and select **Authorize**.
8. Open **View/Download** beside the private key and retain the OpenSSH private-key material securely.
9. Store the private key and passphrase as separate GitHub environment secrets.

The workflow starts an ephemeral `ssh-agent`, unlocks the encrypted key through GitHub's masked secret handling, removes the temporary passphrase helper and uses the loaded key for the remaining deployment steps.

## Protected deployment sentinel

The live directory must contain this file:

```text
/home/jtdlxqpa/public_html/crimsondesert/.github-deploy-target
```

Its complete content must be:

```text
crimson-desert-guide
```

The workflow refuses to deploy or delete stale files unless:

- the deploy path exactly matches `/home/jtdlxqpa/public_html/crimsondesert`;
- the directory exists;
- the sentinel exists;
- the sentinel content matches;
- both `tar` and `rsync` are available on the host.

## Manual production deployment

After the environment secrets and sentinel are configured:

1. Open **GitHub → Actions → Deploy cPanel Production**.
2. Select **Run workflow** on `main`.
3. Confirm that the workflow reaches **Verify live production site**.
4. Open `https://tkb-gaming.scot/crimsondesert/deployment.json` and confirm the commit matches `main`.

Subsequent accepted `main` commits deploy automatically after CI succeeds.

## Rollback

Use a normal Git revert or a dedicated rollback pull request. After the rollback commit passes CI and reaches `main`, the same protected deployment workflow republishes it. Do not manually delete the live directory and do not point the workflow at `public_html` itself.
