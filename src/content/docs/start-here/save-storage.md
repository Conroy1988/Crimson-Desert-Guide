---
title: Save, Storage & Inventory Safety
description: Protect progress, configure cross-save, use Private Storage and avoid destructive inventory mistakes.
currentPatch: 1.14.00
lastVerified: "2026-07-25"
evidence: official
spoilerLevel: none
patchStatus: current
---

Crimson Desert provides automatic and manual saves, platform cloud synchronisation and—since Patch 1.14.00—cross-save between supported platforms. These systems are useful, but they are not substitutes for maintaining multiple save points and verifying which copy is newest.

## The safe routine

At the end of an important session:

1. create a new manual save rather than overwriting the only recent slot;
2. return to a stable menu state before closing the game;
3. fully exit the game;
4. wait for the platform cloud upload to complete;
5. do not launch on another device until that upload is finished;
6. back up the local save folder before clean installs or major troubleshooting.

## Automatic saves are not enough

Automatic saving protects ordinary progress, but it can also preserve a state you did not intend to keep. Manual slots provide recovery points before:

- major quests or difficult encounters;
- changing platform or computer;
- enabling cross-save;
- installing a new game patch;
- changing drivers during crash troubleshooting;
- performing a clean install;
- testing a risky equipment or inventory decision.

Keep at least two rotating manual slots. A simple pattern is:

- **Current** — the latest stable session;
- **Previous** — the prior stable session;
- **Checkpoint** — before a major change or long quest.

## PC and Mac local save locations

Pearl Abyss lists these default locations:

### Windows PC

```text
C:\Users\[Username]\AppData\Local\Pearl Abyss\CD\save
```

### Steam on Mac

```text
~/Library/Application Support/Pearl Abyss/CD/save
```

### Mac App Store

```text
~/Library/Containers/com.pearlabyss.CrimsonDesert/Data/Library/Application Support/Pearl Abyss/CD/save
```

Copy the entire `save` folder to a separate location. Do not edit individual files unless a support instruction specifically requires it.

## Steam Cloud safety

Before closing Steam or turning off the PC:

- wait until synchronisation reaches 100%;
- do not ignore a cloud-conflict prompt;
- back up both available copies before choosing local or cloud data;
- verify the timestamp and expected progress rather than assuming the cloud copy is newer;
- when moving between PCs, finish the upload on the first machine before starting the game on the second.

A failed upload can cause the next device to start from older progress.

## Console cloud safety

Fully close the game before placing the console into rest mode. Uploads may not complete if the console enters rest mode immediately after exit.

When using more than one console:

- confirm the latest save has uploaded from the first console;
- check the platform cloud-save status;
- only then launch on the second device;
- avoid patching or reinstalling while an unresolved sync conflict exists.

Playing offline can create a newer local save than the cloud copy. When reconnecting, confirm the direction of synchronisation before accepting any overwrite.

## Cross-save setup

Patch 1.14.00 added cross-save for:

- PlayStation;
- Xbox;
- Steam;
- Epic Games Store.

The feature uses a dedicated cross-save slot.

### Official setup flow

1. Open **Save Game**.
2. Select **Cross-Save Settings** in the lower-right area.
3. Open the displayed link or scan its QR code.
4. Sign in and connect the platform accounts you intend to use.
5. Return to the game and select **Refresh**.
6. Confirm the cross-save slot appears.
7. Upload the intended save to that slot.
8. On the second platform, verify the linked account and download/use that cross-save slot.

### Cross-save safety rules

- Upload the known-good save; do not assume the newest visible slot is the correct one.
- Keep local manual saves until the transferred progress has been opened and checked.
- Verify character, location, equipment and recent quest progress after transfer.
- Do not repeatedly alternate platforms while either platform is still uploading.
- Treat cross-save as a transfer layer, not your only backup.

## Private Storage

Private Storage can hold items outside the character inventory.

Officially documented locations include:

- the initial temporary lodgings in **Hernand**;
- **Howling Hill Camp**.

Private Storage originally began with 240 slots. Camp expansion can increase it through five stages to a maximum of **1,000 slots**.

### What belongs in storage

Store items that are useful but not required in the immediate loadout:

- spare weapons and armour being compared;
- refinement materials not needed in the current session;
- rare or unfamiliar crafting components;
- mount equipment not currently equipped;
- completion and knowledge-related items;
- consumables held for a later region or encounter;
- duplicate equipment awaiting refinement or extraction decisions.

### What should stay in the active inventory

Carry:

- the current combat loadout;
- healing and recovery items;
- ammunition or weapon-specific consumables in actual use;
- materials required for the next confirmed upgrade;
- food or feed required for the current travel plan;
- items linked to the active objective.

## A safe selling policy

Do not sell by appearance alone. An item may be connected to refinement, knowledge, camp progress, mount trust, cooking, crafting or a later service.

Use this decision order:

1. Is the item marked unsellable or quest-related? Keep it.
2. Is its purpose unknown? Store one stack.
3. Is it a common material used by a system already introduced? Keep a working reserve.
4. Is it an obvious duplicate of replaceable low-value equipment? Compare first, then sell or extract.
5. Is inventory pressure the only reason for selling? Use Private Storage or pursue capacity expansion first.

## Equipment disposal: sell, keep or extract

### Keep

Keep equipment when it:

- is part of the current loadout;
- has a useful resistance or effect not duplicated elsewhere;
- is required as an upgrade/refinement input;
- has been refined with materials you may want to recover;
- has uncertain collection or completion value.

### Sell

Selling is appropriate when the item is:

- clearly replaceable;
- unrefined or cheap to reproduce;
- not part of a planned loadout;
- not required for a known refinement route;
- occupying space after a direct comparison.

### Extract

Extraction can reduce refined equipment toward its base refinement level and return materials. The item is not destroyed.

Official recovery guidance:

- special materials, including Artifacts and Aeserion's Scale, return at **100%**;
- common materials, including iron ore, copper ore and bloodstones, return at approximately **70%**;
- recovery quantity can vary by material type.

Extraction is therefore a recovery tool, not a free undo button.

## Inventory expansion

Inventory pressure should be handled through several systems rather than permanent selling:

- complete requests that reward capacity;
- check shops for capacity purchases where offered;
- expand the Greymane camp to increase Private Storage;
- store spare equipment and long-term materials;
- clear obvious duplicates after comparison;
- refine the active loadout instead of carrying many competing sets.

## Before a patch or clean install

1. Create a new manual save.
2. Close the game normally.
3. Confirm cloud synchronisation.
4. Copy the local save folder where available.
5. Record the newest slot's date, character and location.
6. Only then patch, verify files, reinstall or change drivers.

## Recovery checklist

After a conflict or transfer:

- [ ] Do not overwrite either copy immediately.
- [ ] Back up local files where available.
- [ ] Compare timestamps.
- [ ] Check which platform/session contains the expected progress.
- [ ] Restore or select the known-good copy.
- [ ] Open the game and verify recent progress.
- [ ] Create a fresh manual save.
- [ ] Allow the corrected copy to upload fully.

## Sources

- [Official Save Data Notice](https://support.pearlabyss.com/crimsondesert/en-US/Faq/Home/Detail?_faqNo=616)
- [Official Cross Save Guide](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=107)
- [Official Patch 1.14.00](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=108)
- [Official Patch 1.00.03 — Private Storage](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=73)
- [Official Patch 1.02.00 — Storage expansion](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=80&pubDate=20260405)
- [Official Patch 1.06.00 — Extraction](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=90&pubDate=20260511)
