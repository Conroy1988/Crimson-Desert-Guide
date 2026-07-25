# Phase 7 technical evidence notes

Verified 25 July 2026 against guide baseline Patch 1.15.00.

## Source precedence

1. Current official Known Issues notice.
2. Current patch and hotfix notices.
3. Official FAQ, save guidance, cross-save guide and performance specification notice.
4. Reproducible editorial diagnostic order.
5. Community reports only after independent reproduction.

An official issue describes a current defect. An editorial path describes a safe way to isolate a symptom; it does not claim the game contains that defect.

## Known Issues baseline

Canonical notice: `https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=68`

- Official revision: `2026/07/24 03:20 UTC`
- Top-level issue count: `11`
- Fingerprint: `8d8553d5b3575a1a86317dcfb9b954ab280b0f9e914ec7ee3e64fe478e5e5ae0`

The July 24 revision removed the earlier AMD 26.6.2/26.6.3 driver warning and livestock-feed record, and added a PlayStation cross-save network-instability issue. Removed records must be retired historically if reintroduced into the dataset; their stable IDs must never be reused for unrelated faults.

## Performance boundaries

- Official specification figures are Pearl Abyss internal-test results, not guaranteed benchmarks.
- The guide does not publish invented FPS expectations for hardware it has not tested.
- Tuning order is editorial and intentionally changes one layer at a time.
- Frame Generation is described as supported only on PC and Mac because that is the official FAQ position.
- Console high-refresh and VRR guidance preserves the official display and HDMI requirements.

## Save and escalation policy

No technical path may recommend deleting save data as a diagnostic action.

Before driver rollback, configuration reset, file verification or reinstalling:

1. create a manual save;
2. identify the newest known-good local/cloud/cross-save copy;
3. back up PC or Mac files where possible;
4. record the current settings and driver version;
5. change one variable at a time.

## Automation policy

`check-known-issues.mjs` fingerprints the official revision timestamp and top-level issue count. A changed fingerprint opens one deduplicated GitHub issue requesting a human evidence review. It does not automatically rewrite technical records because notice changes can remove, revise or add spoiler-sensitive entries.
