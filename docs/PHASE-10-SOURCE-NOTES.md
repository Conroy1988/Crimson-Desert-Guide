# Phase 10 source and maintenance notes

Verified: 25 July 2026  
Guide baseline: Patch 1.15.00

## Canonical input

The Quest Walkthrough & Encounter Encyclopaedia is generated from the Phase 8 canonical source groups:

- `data/content/quests.json`
- `data/content/bosses-rematch.json`
- `data/content/bosses-research.json`
- stronghold records in `data/content/world.json`

The generated detail dataset covers 32 records:

- 11 named quests;
- 2 named Abysses;
- 5 verified Memory Fragment rematches;
- 12 officially named research bosses;
- 2 verified stronghold or liberation systems.

## Detail-status rules

- `supported`: the canonical record is verified and its published checkpoints are already present in official evidence.
- `limited`: an official quest or Abyss name, objective fact or historic blocker exists, but a complete walkthrough does not.
- `research`: the boss identity is official, while route, arena, phases, weaknesses, statistics, rewards and replayability remain unresolved.

A partial canonical record may never be promoted to `supported` by the detail generator.

## Prohibited inference

Do not add:

- objective order inferred from a quest title;
- boss mechanics inferred from appearance or genre conventions;
- weaknesses, damage values, health pools or reward quantities without recorded testing;
- route or prerequisite chains derived from community memory alone;
- old workaround instructions without confirming that the defect remains reproducible on the current patch.

## Local state

Private notes and preparation checks use browser storage only. The state engine rejects unknown record IDs, unknown checklist IDs, foreign schema versions and notes longer than 5,000 characters. JSON backup and restore are local operations and do not upload data.

## Maintenance

After a patch or controlled play test:

1. update the relevant canonical record first;
2. regenerate `data/guide-details.json`;
3. change detail status only when the canonical evidence grade supports it;
4. keep unresolved fields explicit;
5. run `npm run check:all` before publication.
