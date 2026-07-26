# Phase 11 source and maintenance notes

Verified: 26 July 2026  
Guide baseline: Patch 1.15.00

## Canonical inputs

The Collectibles, Knowledge & Challenge Catalogue is generated from the canonical content database after these source groups are combined:

- all 34 official Steam achievement records;
- `data/content/knowledge-challenges.json`;
- existing verified knowledge records in `data/content/world.json`.

The generated catalogue contains 48 records:

- 31 category-level goals;
- 17 individually named entries or challenges;
- 29 official Steam achievement challenge categories;
- 4 individually verified knowledge items;
- 27 research records whose totals, routes or full objective text remain incomplete.

## Primary evidence

- Steam Global Achievements supplies the exact 34 achievement names and completion conditions.
- Patch 1.12.00 confirms 51 entries in `Collectibles — Contract` and names several knowledge entries with restored acquisition routes.
- Patch 1.11.00 confirms the Hernand ranged-weapons book, the Irkyn acquisition condition and pet-registration capacity challenges.
- Patch 1.08.00 names `Shield of Unchanging Will VI`, `Bow Aimed at Fate II` and `Crescent Lake` while recording historic blockers.
- Patch 1.04.00 names several character/faction knowledge entries and records acquisition defects.

## Evidence boundary

A category-level achievement proves only its published category condition. It does not prove:

- the number of individual challenges;
- the complete item or activity list;
- coordinates or an optimal route;
- reward values;
- the exact objective text of a specifically named sub-challenge.

The only catalogue-level total currently published as canonical data is the 51-entry `Collectibles — Contract` category. Personal counts are stored as user research, not as game facts.

## Local state

Catalogue state is browser-only and contains:

- personal discovered counts;
- private notes;
- research-queue flags.

Imports reject foreign backup kinds, unknown IDs, unsupported schema versions, non-integer counts, counts above a published official total, and notes over 5,000 characters.

## Maintenance

After a patch or controlled play test:

1. update the canonical content record first;
2. regenerate `data/content-database.json` and `data/collectible-catalogue.json`;
3. publish an individual entry only when its exact identity is supported;
4. add totals only when the source states a total explicitly;
5. keep unknown coordinates, routes, rewards and objectives unresolved;
6. run `npm run check:all` before publication.
