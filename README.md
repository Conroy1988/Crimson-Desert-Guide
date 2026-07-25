# Crimson Desert Guide

[![CI](https://github.com/Conroy1988/Crimson-Desert-Guide/actions/workflows/ci.yml/badge.svg)](https://github.com/Conroy1988/Crimson-Desert-Guide/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Conroy1988/Crimson-Desert-Guide/actions/workflows/codeql.yml/badge.svg)](https://github.com/Conroy1988/Crimson-Desert-Guide/actions/workflows/codeql.yml)

**Live guide:** https://crimson-desert-guide.dannyconroy.workers.dev/

An independent, evidence-backed and patch-aware guide to **Crimson Desert**. The repository is the canonical source for the website, structured guide data, update history and automation.

> **Current verified baseline:** Patch **1.14.00**, published 16 July 2026 and verified against the official Crimson Desert announcement list on 25 July 2026.

## Objectives

- Build a premium guide rather than a collection of disconnected articles.
- Mark every gameplay claim with a patch, verification date, evidence grade and spoiler level.
- Detect new official patches automatically and create a review task.
- Publish a fast, searchable and mobile-friendly site through Cloudflare Workers.
- Maintain an export path for a condensed Steam Guide mirror.
- Keep the entire project reproducible, reviewable and free to host.

## Stack

- **Astro 6 + Starlight** for the static guide website.
- **GitHub Actions** for validation, security scanning, content-health checks and patch monitoring.
- **Cloudflare Workers Builds** for production hosting and preview deployments.
- **Pagefind**, built into Starlight, for local full-text search.

## Local development

Requires Node.js **22.12.0 or newer**.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run check:all
```

## Repository map

```text
src/content/docs/       Guide pages
src/styles/             Site theme
data/                   Patch and export metadata
scripts/                Content and automation tooling
.github/                Workflows, issue forms and repository policy
docs/                    Operator setup instructions
```

## Evidence model

| Grade | Meaning |
|---|---|
| `official` | Directly supported by Pearl Abyss material |
| `verified` | Reproduced through controlled in-game testing |
| `community` | Independently corroborated by multiple credible reports |
| `provisional` | Useful lead that still requires confirmation |

## Licensing

- Website code and automation: [MIT](LICENSE)
- Original written guide content: [CC BY-SA 4.0](LICENSE-CONTENT.md)
- Crimson Desert names, trademarks and third-party game assets remain the property of their respective owners and are excluded from those licences.

This is an unofficial fan project and is not affiliated with or endorsed by Pearl Abyss.
