---
title: Update Log
description: Chronological record of material changes made to the Crimson Desert Guide.
currentPatch: 1.15.00
lastVerified: "2026-07-25"
evidence: verified
spoilerLevel: none
patchStatus: current
---

## 25 July 2026 — Technical and performance centre

- Replaced the provisional Technical page with a filterable platform and symptom troubleshooting centre.
- Structured the official Known Issues notice revised on 24 July 2026 into 11 stable records.
- Added safe-first diagnostic paths for crashes, white screens, save conflicts, cross-save, input, performance and console display modes.
- Added explicit save-preservation and destructive-escalation warnings.
- Added platform, symptom, record-type, severity and text-search filters.
- Added technical-data validation for patch alignment, stale records, sources, enums and duplicate IDs.
- Added a six-hour official Known Issues watcher with revision fingerprints and deduplicated GitHub issues.
- Added a Technical & Performance section to the generated Steam BBCode guide.

## 25 July 2026 — Interactive completion companion

- Replaced the static completion roadmap with a local-first interactive tracker.
- Added 18 supported starter milestones across activities, settlements, travel, mounts, equipment and knowledge.
- Added category, progress, spoiler and text-search filters with overall and per-category totals.
- Added browser-only persistence with no account, cookies, telemetry or remote database.
- Added validated JSON export/import, confirmation-based reset and strict rejection of unknown IDs or foreign backup formats.
- Added stable-ID migrations for renamed and retired records so dataset updates do not silently erase valid progress.
- Added spoiler-safe checklist cards with explicit reveal state stored separately from completion state.
- Added completion-data and state-engine tests to the protected Quality Gate.
- Added a static Completion Companion section to the generated Steam BBCode guide.

## 25 July 2026 — Mobile stylesheet delivery fix

- Investigated an iOS Brave production report where the guide rendered as unstyled raw HTML.
- Removed the runtime dependency on external screen stylesheets by embedding the complete Astro/Starlight visual system in every generated HTML page.
- Added a deployment smoke test that rejects missing mobile viewport metadata, insufficient inline CSS, external screen-stylesheet dependencies and missing local asset references.
- Made Cloudflare Workers static-site trailing-slash and 404 handling explicit.
- Added immutable caching for fingerprinted `/_astro/` assets while retaining content-hashed filenames.

## 25 July 2026 — World and traversal compendium

- Added validated structured records for settlements, services, special-mount species and saddlery inventories.
- Added an automated world-data audit that checks patch alignment, evidence grades, official sources, unique records and saddlery cross-references.
- Added a world-navigation guide covering regional arrival procedure, map discovery, Mysterious Energy and Abyss Nexus travel.
- Replaced the Hernand placeholder with a generated service register and practical settlement circuit.
- Added a complete mounts guide covering trust, taming, feeding, registration, quickslots, equipment and terrain-based selection.
- Expanded Blackstar behind the existing major-spoiler gate using official patch history without publishing an unverified unlock sequence.
- Expanded the generated Steam BBCode guide with World Navigation and Mounts sections.

## 25 July 2026 — Combat and gear systems

- Replaced the provisional Combat page with a complete fight-control guide covering camera, positioning, defence, stamina, Spirit, stun pressure, groups, large targets and healing windows.
- Added a weapon and skill evaluation framework based on reach, recovery, resource cost, crowd control, mobility, defensive fit and terrain tolerance.
- Added a boss and encounter diagnostic that separates visibility, positioning, recognition, defence, resources, gear and known defects.
- Rebuilt the Gear page with keep, sell, store, refine and extract decisions.
- Documented official extraction behaviour, including 100% special-material recovery and approximately 70% common-material recovery.
- Added refinement stopping rules, identical-equipment gates, sockets, Abyss Gear and character-specific loadout checks.
- Expanded the generated Steam BBCode guide with four combat and gear sections.

## 25 July 2026 — Patch 1.15.00 baseline

- Verified the official Patch 1.15.00 notice published on 24 July 2026.
- Updated the global guide baseline, homepage intelligence and page metadata from 1.14.00 to 1.15.00.
- Reviewed current pages against the patch's narrow combat, camera, mount and equipment-lock changes.
- Added current known-issue warnings for remapped Hold evasion and Damiane's Shield Toss failure state.
- Confirmed that the core beginner route, storage guidance, refinement rules and extraction model remain valid.
- Recorded the Mac App Store rollout as still in progress at the time of verification.

## 25 July 2026 — Beginner guide expansion

- Replaced the provisional beginner roadmap with a complete low-spoiler opening route.
- Added platform-specific readability, accessibility, controller and performance guidance.
- Added a dedicated save, cross-save, Private Storage and inventory-safety guide.
- Added the first systems circuit covering travel, smithies, refinement, extraction, vendors, mounts and camp progression.
- Re-verified all precise beginner claims against Patch 1.14.00, official support notices and current known issues.
- Expanded the generated Steam BBCode guide from two beginner sections to four.

## 25 July 2026 — Premium guide experience

- Replaced the documentation-style homepage with a purpose-built cinematic guide interface.
- Added direct routes into beginner, combat, gear, world, mounts, completion and technical guidance.
- Added patch status, verification date, evidence grade and spoiler metadata to article headers.
- Added accessible spoiler-reveal controls for major discoveries.
- Rebuilt the global visual system for desktop, tablet and mobile layouts.
- Added an independent project footer and stronger accessibility focus states.

## 25 July 2026 — Production launch

- Deployed the guide through Cloudflare Workers Builds.
- Published the production site at `crimson-desert-guide.dannyconroy.workers.dev`.
- Added static-assets deployment configuration through Wrangler.
- Updated canonical URLs, sitemap discovery and repository documentation.

## 25 July 2026 — Platform foundation

- Created the canonical public GitHub repository.
- Established the Astro and Starlight guide framework.
- Added patch-aware frontmatter and automated content validation.
- Added scheduled official patch monitoring.
- Added GitHub issue forms, security scanning and contribution policy.
- Established Cloudflare Workers deployment instructions.
- Set the verified guide baseline to official Patch **1.14.00**.

Future entries are added above older entries so the newest guide changes remain immediately visible.
