---
title: Essential Settings
description: Current Patch 1.14.00 recommendations for controls, readability, accessibility and performance on PC, PlayStation 5 and Xbox Series X|S.
currentPatch: 1.15.00
lastVerified: "2026-07-25"
evidence: official
spoilerLevel: none
patchStatus: current
---

This page separates **officially available options and known issues** from **editorial recommendations**. There is no single perfect preset: display, hardware, eyesight, motion sensitivity and control preference all change the correct answer.

## Five-minute setup

Before the first long session:

1. increase **Minimum Font Size** until inventory descriptions can be read without leaning forward;
2. set subtitle size to the largest comfortable option;
3. adjust camera distance, offsets, auto-follow and lookahead;
4. enable colourblind or photosensitive options where relevant;
5. remap any defensive control that is difficult to press reliably;
6. choose a graphics target that holds a stable frame rate in combat;
7. make a manual save and confirm platform cloud synchronisation.

## Readability and accessibility

Crimson Desert has gained several accessibility options through post-launch updates.

### Recommended starting points

| Option | Starting recommendation | Why |
|---|---|---|
| Minimum Font Size | Increase until item text is comfortable at normal distance | It affects menus and reduces repeated zooming or leaning |
| Subtitle Font Size | Large or Max where needed | Dialogue can occur during movement and combat |
| Colourblind Mode | Use the mode that most clearly separates interface states | Selection is personal; verify colours in inventory and combat UI |
| Photosensitive Mode | Enable if flashes or rapid effects are uncomfortable | Reduces exposure to problematic presentation |
| Chromatic Aberration | Disable if edge blur causes discomfort | This is a preference, not a performance requirement |
| Night Tone Mode | Enable if dark shaded areas are difficult to distinguish | It softens colours and improves visibility in some dark scenes |
| Fast Forward Speed | Set conservatively before increasing | Up to 4× is available for viewed dialogue/cutscene handling |

Pearl Abyss added Minimum Font Size, camera controls, colourblind mode, chromatic aberration and photosensitive mode across updates 1.03 and 1.04. Minimum Font Size changes now apply immediately.

## Camera setup

Use a quiet area and test:

- **Camera Visual Range** — increase if the character occupies too much of the screen;
- **Vertical Offset** — adjust so the horizon and nearby enemies remain visible;
- **Horizontal Offset** — useful if centred framing obscures the direction of travel;
- **Camera Auto-follow** — reduce or disable if automatic correction fights manual input;
- **Camera Lookahead** — lower it if forward movement causes unwanted camera drift.

### Practical method

1. stand still and centre the camera;
2. run in a circle without touching the camera;
3. sprint in a straight line;
4. lock on to one enemy;
5. disengage and turn away;
6. adjust one option only;
7. repeat.

Changing several camera values together makes it difficult to identify which option solved or caused the problem.

## Controller setup

Controller remapping was added in Patch 1.09.00 and is available across platforms.

### Recommended priority order

Remap controls based on consequences:

1. dodge/evasion;
2. block or defensive action;
3. lock-on or camera reset;
4. healing;
5. frequently used weapon actions;
6. interaction and utility actions.

A defensive action should not require releasing the camera stick at the moment it is needed.

### Current known issue

When **Evasion Control** is set to **Hold**, the original default Evasion key may still function after remapping. This remains listed in the official known-issues notice as of 20 July 2026. Test the new mapping in a safe area before relying on it in a difficult fight.

### PC controller support

The PC version officially supports:

- Xbox controllers;
- DualSense via **USB**.

If Steam Input produces duplicated or incorrect prompts, compare behaviour with Steam Input enabled and disabled. Do not change several controller layers at once.

## Keyboard and mouse setup

There is no universal key layout, but the following rules are reliable:

- keep dodge, block and healing within one hand movement;
- avoid binding two high-frequency combat actions to the same finger;
- keep interaction separate from an attack used near NPCs or objects;
- preserve an easy camera-reset or lock-on input;
- test inventory right-click actions after rebinding, because keyboard/mouse inventory interaction has been revised in later patches.

Use the opening encounters as a control test, not a damage test. A layout is poor if you can perform a combo but cannot interrupt your own aggression to defend.

## PC graphics and performance

### Use the official hardware baseline

Crimson Desert requires DirectX 12 on PC. Pearl Abyss publishes separate performance specifications and notes that results vary with hardware, software and individual graphics settings.

### Stable-frame-rate rule

Choose the highest settings that remain stable in ordinary combat, not the highest settings that look good while standing still.

A sensible tuning order is:

1. select the intended output resolution;
2. choose one upscaler or native rendering;
3. establish a stable base frame rate;
4. add frame generation only after the base frame rate is responsive;
5. reduce ray-traced lighting/shadows or other expensive effects before lowering textures on a GPU with adequate VRAM;
6. retest in rain, settlements and combat.

### Upscaling and frame generation

The PC version supports FSR, DLSS and Intel XeSS technologies. Frame generation is available on PC, but Pearl Abyss warns that very low base frame rates can produce poor responsiveness and image stability.

For capture setups using Windows duplicate display, DLSS Multi Frame Generation can reduce capture quality. Pearl Abyss recommends maintaining a sufficient base frame rate and, for that scenario, disabling vertical-synchronisation-related settings such as V-sync and G-sync.

### Current PC known issues

As of the current official notice:

- **AMD driver 26.6.2 and 26.6.3** can cause crashes; use 26.6.1 or 26.6.4 and later;
- GTX 1060 systems can show a white screen when FSR Upscaling and Frame Generation are enabled together;
- FSR4 can make rain disappear or create blur/distortion in rainy environments;
- the official general recommendation is AMD 25.9.2 or later and NVIDIA 581.29 or later, subject to the specific AMD exception above.

Do not update a stable system into a version listed as problematic simply because it is numerically newer.

## PlayStation 5 and PlayStation 5 Pro

### Display connection

Some higher-refresh console modes require:

- a compatible 120 Hz or 240 Hz display;
- HDMI 2.1;
- VRR support where a VRR mode is used.

If the image appears unexpectedly soft, Pearl Abyss specifically recommends checking HDMI 2.1 cable support.

### Platform features

- PS5 uses FSR 3 support;
- PS5 Pro supports upgraded PSSR;
- console frame generation is not listed as supported;
- a **Sharpness Enhancement** option is available on base PS5.

### Current PlayStation known issue

Rapidly typing a pet or horse name with the virtual keyboard may freeze the screen. Enter characters slowly with brief pauses until the issue is removed from the official known-issues list.

### Recommended approach

Prefer the mode that remains stable in combat and camera movement. A sharper screenshot is less valuable than consistent input response during boss patterns.

## Xbox Series X|S

### Display connection

Use HDMI 2.1 and a compatible display for modes that require higher refresh rates or VRR. If the picture looks blurred, verify the cable and display input mode before changing every in-game setting.

### Platform features

- Xbox Series X|S supports FSR 3;
- Sharpness Enhancement is available;
- console frame generation is not listed as supported.

### Recommended approach

On Series S especially, prioritise consistent motion and readable image reconstruction over maximum effects. Test sharpness in foliage, hair and distant architecture rather than only in menus.

## HDR, darkness and presentation

Use HDR only when the display is correctly configured at system level. If black levels are crushed or highlights clip:

1. calibrate the console or operating system HDR output;
2. confirm the display input is using the intended HDR mode;
3. test the game with Night Tone Mode off and on;
4. compare SDR before assuming the game setting is the only cause.

Night Tone Mode is an accessibility/presentation choice, not a requirement. It can make shaded areas easier to read but changes the intended contrast.

## Save and synchronisation settings

Settings are only useful if progress is safe.

- allow Steam Cloud to reach 100% before closing Steam or shutting down the PC;
- fully close the game before putting a console into rest mode;
- confirm cloud upload before launching on another device;
- back up local saves before clean installs or driver troubleshooting;
- use multiple manual slots;
- read [Save, Storage & Inventory Safety](/start-here/save-storage/) before enabling cross-save across several platforms.

## Recommended baseline profiles

These are decision profiles, not fixed values.

### Readability-first

- larger font and subtitles;
- increased camera range;
- reduced camera auto-follow;
- photosensitive mode where required;
- chromatic aberration off;
- Night Tone Mode tested in dark environments.

### Performance-first

- stable base frame rate;
- moderate upscaling quality rather than aggressive frame generation;
- expensive ray-traced effects reduced first;
- motion tested in combat and rain;
- no driver version listed in known issues.

### Cinematic-first

- higher image quality with frame-rate expectations accepted;
- HDR calibrated correctly;
- motion effects retained only if comfortable;
- avoid sacrificing control responsiveness for an unstable target.

## Sources

- [Official Patch 1.03.00 — camera and font settings](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=81&pubDate=20260411)
- [Official Patch 1.04.00 — accessibility options](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=84)
- [Official Patch 1.04.02 — immediate font-size changes](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=87)
- [Official Patch 1.09.00 — controller remapping](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=94&pubDate=20260612)
- [Official performance specifications](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=62)
- [Official FAQ](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=63)
- [Current known issues](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=68)
