# Phase 12 source and maintenance notes

Verified: 26 July 2026  
Game baseline: Patch 1.15.00  
Guide target: v1.0.0

## Playable-character boundary

The official Steam store description names exactly three playable characters:

- Kliff;
- Oongka;
- Damiane.

It states that Oongka and Damiane join as the story unfolds and that each character has a distinct combat style, skills and weapons. The guide does not publish spoiler-sensitive unlock timing unless an official current-patch source supplies it directly.

## Capability evidence

Character profiles use official patch history:

- Patch 1.03.00: Focused Aerial Roll; Axiom Force, Nature's Snare and open-world capability changes for Oongka/Damiane.
- Patch 1.04.00: Ambush, Force Palm-equivalent skills, Oongka blaster/Flight changes and Quick Reload acquisition expansion.
- Patch 1.06.00: unarmed-flow improvements and weaponless Blinding Flash.
- Patch 1.07.00: Damiane unarmed skills, Aerial Stab and Kliff's Blinding Flash Finisher.
- Patch 1.09.00: finisher-equivalent additions for Oongka/Damiane.
- Patch 1.12.00: Visiones, memory reading, Blackstar mounting, sliding chains and equipment additions.
- Patch 1.13.00: Oongka/Damiane Abyss access and broad equipment compatibility changes.
- Patch 1.15.00: Oongka/Damiane gear-lock persistence fix.

Current character constraints are linked to the official Known Issues dataset, particularly Greymane faction progression for Oongka/Damiane and Damiane's Shield Toss death state.

## Prohibited optimisation claims

The guide does not publish:

- a universal best character, weapon or build;
- unsupported tier lists;
- exact DPS, damage coefficients or hidden scaling;
- frame data without recorded measurement;
- cross-character comparisons made with different equipment, targets or conditions;
- personal test observations as public canonical truth.

## Build archetypes

The eight Build Laboratory archetypes are editorial testing frameworks, not performance rankings:

- Field-Balanced;
- Defensive Control;
- Aerial Mobility;
- Ranged Pressure;
- Heavy Impact;
- Unarmed Chain;
- Boss Reliability;
- Exploration Utility.

They expose priorities, trade-offs and repeatable protocols. Suggested characters reflect confirmed capability families only and do not guarantee compatibility with every weapon selection.

## Local Build Laboratory state

Build tests are stored only in browser localStorage and include:

- a stable private test ID;
- test name, character, archetype, weapon family and encounter;
- fixed conditions and observations;
- optional personal scores from 1–5 across seven dimensions;
- confidence state;
- creation and update timestamps.

Imports reject unknown characters, archetypes, weapons, encounters or dimensions; invalid scores; duplicate IDs; foreign backup kinds; more than 100 tests; and text over 5,000 characters.

## v1.0 interpretation

The readiness report separates three concepts:

1. **Programme completion** — every planned guide route, dataset, interactive tool and validation system is present.
2. **Evidence safety** — every canonical record is verified or explicitly partial, with unknown values left unknown.
3. **Game exhaustiveness** — partial records remain in an ongoing research queue because the source does not disclose or the guide has not yet controlled-tested all details.

A 100% programme score does not erase the research queue. It confirms the guide has a complete, auditable system for representing both known and unknown current-patch information.

## Deferred domain work

The content release remains on the existing Cloudflare Worker until `tkb-gaming.scot` is live. The later path migration to `/crimsondesert/`, consent management and advertising integration are operational tasks, not content-readiness blockers.
