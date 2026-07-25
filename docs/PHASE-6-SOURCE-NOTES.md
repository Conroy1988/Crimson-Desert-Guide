# Phase 6 source and data notes

## Purpose

Phase 6 adds the first interactive Completion Companion without presenting the current repository as a complete game database.

The tracker is seeded only from mechanics, services, items and progression actions already supported by the guide or official patch history.

## Dataset boundary

Seeded categories:

- Activities & Systems
- Settlements & Travel
- Mounts & Creatures
- Equipment & Progression
- Collectibles & Knowledge

Planned but deliberately empty:

- Bosses & Rematches
- Stronghold & Liberation

An empty category means the guide has not yet verified enough records to publish responsibly. It does not mean the game contains no content in that category.

## Official source families

The initial official records use existing repository sources, principally:

- official FAQ and save guidance;
- Patch 1.06.00 for special mounts, saddles, equipment sockets, refinement and extraction;
- Patch 1.10.00 for Baby Wyvern and Kuku Bird Chick special-mount support;
- Patch 1.11.00 for Hernand's equipment-shop book.

Community-grade records remain labelled `community` and link to the relevant guide page rather than being silently promoted to official or verified.

## Stable-ID policy

Entry IDs are persistence keys, not display text.

Once an ID ships:

1. changing the title does not require changing the ID;
2. a renamed ID must be added to `migrations.renamedIds`;
3. a removed ID must be added to `migrations.retiredIds`;
4. an ID cannot be active, renamed and retired simultaneously;
5. unknown imported IDs are rejected rather than discarded silently.

This policy prevents guide updates from erasing valid user progress.

## Import and privacy policy

- State is stored only in browser local storage.
- Exports contain project kind, schema version, dataset version, game patch, timestamp, completed IDs and revealed IDs.
- Imports are size-limited and validated before confirmation or persistence.
- Invalid files never replace the currently loaded state.
- No account, cookie, analytics system or server-side database is used.

## Test coverage

The Quality Gate now verifies:

- completion schema and patch alignment;
- category and entry ID uniqueness;
- prerequisite integrity;
- evidence, spoiler and patch-state values;
- official-source requirements;
- migration consistency;
- empty-state creation;
- export/import round trips;
- duplicate removal;
- rejection of foreign formats, unknown IDs and invalid schemas;
- renamed and retired ID migration.
