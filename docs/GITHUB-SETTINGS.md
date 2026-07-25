# Recommended GitHub Repository Settings

Apply these after the initial bootstrap pull request has passed CI and been merged.

## General

- Description: `An evidence-backed, patch-aware Crimson Desert guide, database and interactive completion companion.`
- Website: add the Cloudflare Pages production URL after deployment.
- Topics: `crimson-desert`, `game-guide`, `astro`, `starlight`, `cloudflare-pages`, `gaming`
- Enable **Issues** and **Discussions**.
- Disable **Projects** and **Wiki** unless they gain a defined use.
- Enable **Sponsorships** only if a funding model is intentionally introduced.

## Labels

Create these repository labels before opening public issue intake:

| Label | Purpose | Suggested colour |
|---|---|---|
| `bug` | Website or automation defect | `d73a4a` |
| `content: correction` | Incorrect or outdated guide information | `b60205` |
| `research: discovery` | Community finding awaiting verification | `5319e7` |
| `patch-watch` | New official patch detected | `fbca04` |
| `content-review` | Page needs evidence or patch re-verification | `f9d0c4` |
| `documentation` | Guide structure or prose work | `0075ca` |
| `automation` | Workflow, bot or scheduled task | `1d76db` |
| `spoiler` | Contribution contains major spoilers | `6f42c1` |

The issue forms already reference the first three labels. GitHub will still accept forms before labels exist, but the labels will not be applied automatically until created.

## Pull requests

- Enable **Allow squash merging**.
- Disable merge commits and rebase merging.
- Default squash commit message: pull request title and description.
- Enable **Always suggest updating pull request branches**.
- Enable **Allow auto-merge**.
- Enable **Automatically delete head branches**.

## Actions

Under **Settings → Actions → General**:

- Allow actions created by GitHub.
- Permit the actions used in this repository:
  - `actions/checkout`
  - `actions/setup-node`
  - `actions/upload-artifact`
  - `github/codeql-action`
- Set workflow permissions to **Read and write**.
- Enable **Allow GitHub Actions to create and approve pull requests** for future patch-maintenance automation.

Each workflow still declares narrower permissions.

## Main branch ruleset

Create an active branch ruleset named `Protect main` targeting the default branch.

Enable:

- Restrict deletions.
- Require linear history.
- Require a pull request before merging.
- Required approvals: `0` while Daniel is the sole maintainer.
- Dismiss stale approvals: off.
- Require conversation resolution.
- Require status checks.
- Block force pushes.

After `CI / Quality Gate` has completed successfully at least once, add **Quality Gate** as a required check. Add **CodeQL** only after confirming its first successful run.

Allow the repository administrator to bypass only for emergency recovery, set to **For pull requests only** where GitHub offers that option.

## Security

Under **Settings → Advanced Security**:

- Enable dependency graph.
- Enable Dependabot alerts.
- Enable Dependabot security updates.
- Enable grouped security updates.
- Enable secret scanning.
- Enable push protection.
- Enable private vulnerability reporting.

CodeQL is also configured through `.github/workflows/codeql.yml`.

## Moderation

- Enable interaction limits temporarily during spam or launch surges.
- Keep issue forms as the only public issue entry points.
- Use Discussions for open-ended questions and community research, not Issues.
