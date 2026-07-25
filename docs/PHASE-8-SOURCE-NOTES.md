# Phase 8 source notes — Content database

Verified: 25 July 2026  
Game baseline: Patch 1.15.00

## Canonical sources

- Steam Global Achievements for app 3321460: exact names and completion conditions for all 34 achievements.
- Patch 1.05.00: Rematch and Re-blockade systems, Memory Fragments, Reminisce/Resonate and the original 69-boss rematch baseline.
- Patch 1.07.00: verified rematch names and locations for Muskan, Corrupted Caliburn, Goyen, Draven the Crowcaller and Clockwork White Horn.
- Patch 1.06.00: additional boss identities and named quest progression fixes.
- Official boss battle trailers: White Horn, Staglord, Reed Devil and Queen Stoneback Crab.
- Patch 1.15.00: Scattered Honey Jars.
- Patch 1.13.00/1.13.01: Abandoned Drilling Rig, One-Armed Ludvig and Hoenmark Ruins.
- Patch 1.10.00: Jijeong Temple in Chaos.
- Patch 1.08.00: A Wife's Show of Heart.
- Patch 1.00.03: Reunion, Mysterious Pot, Turnali's Request and Ethereal Pathway.
- Patch 1.06.01: Vault of Vengeance.
- Patch 1.00.02: Chapter 3 Abyss Gear tutorial.
- Patch 1.11.00: Ranged Weapons of the World — Bows, Vol. I.

## Evidence decisions

1. A record can be officially named but still remain `partial`.
2. Partial records are searchable and spoiler-controlled but excluded from completion totals.
3. A record becomes completion-eligible only when an official source supplies a stable completion condition or the documented system makes the condition explicit.
4. Boss identities mentioned only in bug fixes or trailers do not receive invented routes, rewards or rematch locations.
5. The five Patch 1.07 rematch bosses receive first-defeat milestones because Patch 1.05 explicitly states Memory Fragments activate after the boss is defeated.
6. Hoenmark Ruins receives a liberation milestone because Patch 1.13.01 explicitly confirms that it is a liberatable location.
7. Existing non-catalogue completion milestones remain stable and are not renamed.

## Maintenance rules

- Stable IDs must never be reused for a different record.
- Renames go through `migrations.renamedIds`.
- Removed records go through `migrations.retiredIds`.
- A patch that changes a quest, boss, stronghold or achievement requires content-database review.
- New records must include at least one HTTPS source and an evidence classification.
