## Technical triage rule

Preserve saves and evidence before changing the system. Record the platform, game patch, driver version, location, action and graphics/input settings involved. Change one variable at a time and repeat the same test.

Do not delete save data to diagnose crashes, graphics, input or performance faults.

## Current official issues most likely to look technical

| Platform | Symptom | Current action |
|---|---|---|
| PlayStation | Cross-save error during network instability | Preserve the source save, stabilise the connection and retry without overwriting another platform's known-good copy |
| PC / GTX 1060 | White screen with FSR Upscaling and Frame Generation | Disable Frame Generation first; do not reinstall or delete saves |
| PC / FSR 4 | Rain disappears or the image becomes blurred or distorted | Switch from FSR 4 and repeat the same rainy scene |
| PC | Hold evasion still responds to the original key after remapping | Avoid conflicting use of the original key and test both bindings |
| Mac | Furniture cursor does not match the placement point | Test another supported resolution or controller input |
| Mac | Colourblind mode does not affect the UI | Use other contrast aids and report unreadable interface states |
| PlayStation | Rapid pet or horse name entry freezes the screen | Enter characters slowly with brief pauses |

## PC crash: safe order

1. Create a manual save and copy the local save folder.
2. Confirm the current game patch is installed.
3. Record the crash scene, action, preset and driver version.
4. Return overclocks or undervolts to a known-stable profile.
5. Lower one high-cost graphics feature and repeat the same scenario.
6. Verify files only after preserving saves.
7. Roll back a driver only when a known regression or repeatable change supports it.
8. Reinstall last.

## White screen or reconstruction defect

Disable Frame Generation before changing resolution. Then test the upscaler, reconstruction mode and sharpening separately. GTX 1060 with FSR plus Frame Generation is an official known issue. FSR 4 currently has a known rainy-environment defect.

## Stable performance tuning order

1. choose a repeatable test route and target mode;
2. set resolution and display mode;
3. choose one upscaler and quality level;
4. adjust ray-traced effects;
5. reduce shadows, volumetrics and reflections;
6. reduce textures only when memory pressure supports it;
7. enable Frame Generation last and only on supported PC or Mac hardware.

Official performance figures are internal-test baselines, not guaranteed results for every system.

## Console display path

Confirm the display, input and cable support the selected refresh rate and VRR feature. Official guidance requires compatible 120/240 Hz displays and HDMI 2.1 for relevant high-refresh features, and a VRR-compatible display for VRR. Return to default 60 Hz output if the display loses signal or behaves unpredictably.

## Cloud and cross-save safety

Stop before choosing either side of a cloud conflict. Compare timestamps and preserve the newest known-good copy. Allow platform synchronisation to complete before shutdown or switching devices. For cross-save errors, keep the source platform's manual save untouched and upload only after linked platforms and the Cross-Save slot are confirmed.

## Sources

- [Current Known Issues](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=68)
- [Frequently Asked Questions](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=63)
- [PC, Console and Mac Performance Specs](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=62)
- [Cross Save Guide](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=107)
