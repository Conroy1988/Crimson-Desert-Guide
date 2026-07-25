---
title: Boss & Encounter Diagnosis
description: Identify why a difficult fight is failing and apply the smallest correct change before spending rare resources.
currentPatch: 1.15.00
lastVerified: "2026-07-25"
evidence: community
spoilerLevel: none
patchStatus: current
---

A difficult encounter should be treated as a diagnosis problem, not immediately as a gear check.

The objective is to identify the **first failure in the chain**. Later problems are often consequences of that first error.

Example:

> The player is hit because the camera loses the boss, panic-dodges twice, empties stamina, then dies while healing.

The root problem is not healing speed or defence. It is visibility and camera control.

## The seven failure classes

| Failure class | Typical symptom | First correction |
|---|---|---|
| Visibility | Attack cue, enemy or hazard cannot be seen | change camera, lock-on or position |
| Position | Trapped at wall, edge, body or enemy group | move earlier and preserve escape space |
| Recognition | Same attack repeatedly lands | isolate and learn that cue |
| Defence | Correct cue seen but wrong response chosen | test block, dodge, counter or movement separately |
| Resources | No stamina or Spirit when defence is needed | shorten offence and preserve reserve |
| Damage/gear | Mechanics are stable but encounter becomes an endurance failure | review refinement, sockets and loadout role |
| Defect | Inputs or state behave inconsistently under repeatable conditions | reload, check known issues and document reproduction |

Do not change several categories simultaneously. One controlled correction produces useful evidence; a complete rebuild hides the cause.

## Step 1 — confirm the fight is functioning correctly

Before analysing skill or gear, check for known or visible defects.

### Patch 1.15.00 fixes

Patch 1.15.00 corrected several encounter issues, including bosses appearing transparent during battle. If the current version still renders a boss, attack effect or critical arena element incorrectly, treat that as a technical fault—not intended difficulty.

### Current known issues

- If **Evasion Control** is set to **Hold**, the original default Evasion key may still work after remapping.
- If Damiane dies immediately after using **Shield Toss**, she may lose access to her shield and related skills. Saving and reloading is the official workaround.

If a fight changes dramatically after reload, record the state rather than assuming the build suddenly improved.

## Step 2 — perform a learning attempt

A learning attempt is not a failed damage attempt. Its purpose is to collect information.

For the first 30–60 seconds:

- use only short attacks;
- keep the enemy centred without forcing lock-on;
- preserve stamina and Spirit;
- identify attack cues and recovery windows;
- note arena edges, obstacles and unsafe terrain;
- do not use every healing item simply to extend a bad attempt.

Record three things:

1. the attack that causes the most damage;
2. the moment resources become unsafe;
3. the position where camera or movement fails.

That is enough to choose the next test.

## Visibility diagnosis

### Symptoms

- attacks arrive from outside the screen;
- the enemy's body blocks its own cue;
- lock-on forces an unusable angle;
- the player attacks the wrong target;
- environmental hazards disappear behind effects or terrain.

### Corrections

- unlock during large-body or multi-enemy phases;
- increase camera range or change offsets in [Essential Settings](/start-here/essential-settings/);
- move laterally into open ground rather than directly backward;
- reposition before attacking, not after the camera is already trapped;
- reduce visual settings only when effects, performance or image reconstruction obscure cues.

### Test

Attempt the phase without attacking. If visibility remains stable while only moving and defending, offence or positioning—not the camera option alone—is causing the loss of sight.

## Position diagnosis

### Symptoms

- repeated deaths near a wall or arena edge;
- dodges collide with the boss or scenery;
- healing is interrupted despite apparently large distance;
- group enemies surround the player;
- the camera clips into a large target.

### Corrections

- treat open ground as a resource;
- move away from the edge before beginning a punish;
- circle toward visible space, not automatically away from the boss;
- use terrain to block ranged lines without trapping yourself;
- stop the attack string one action earlier and relocate.

### Test

Choose one arena landmark as the danger boundary. End every offensive sequence before crossing it. If survival improves, the failure was positional rather than numerical.

## Recognition diagnosis

### Symptoms

- one attack repeatedly lands despite adequate resources;
- the player reacts to the wrong part of a multi-hit sequence;
- a delayed attack catches an early dodge;
- a phase change is mistaken for a damage opening.

### Corrections

- name the attack by its first visible cue;
- defend normally until the full sequence is understood;
- count hits only after observing several repetitions;
- separate similar-looking attacks by audio cue, weapon position or movement direction;
- delay the counter attempt until the cue is reliable.

### Test

Do not punish the target after the problem attack. Defend it five times. If the success rate rises when offence is removed, greed or uncertainty—not equipment—is the cause.

## Defence diagnosis

### Symptoms

- the cue is recognised but block, dodge or counter still fails;
- the first hit is avoided but a follow-up lands;
- a counter begins but is interrupted;
- blocking survives the hit but empties stamina.

### Corrections

| Situation | Test first |
|---|---|
| Wide fixed attack | lateral movement |
| Unknown sequence | block while observing stamina |
| Familiar single strike | parry or counter |
| Tracking attack | later dodge or change direction |
| Multi-hit pressure | disengage before the sequence |
| Unblockable or overwhelming effect | leave the area rather than contesting it |

A defensive action must solve the entire immediate sequence, not merely the first impact.

## Resource diagnosis

### Symptoms

- stamina is empty immediately before the dangerous attack;
- Spirit-dependent defence or movement is unavailable;
- repeated dodges create more danger;
- Quick Swap or a skill consumes an unexpected resource;
- healing is attempted because no defensive action remains.

### Corrections

- remove the final attack from each punish;
- stop sprinting unnecessarily inside the arena;
- release block when no attack is active;
- replace a high-cost action with a lower-cost core option;
- preserve enough resource for one defensive correction;
- verify weapon and skill requirements in [Weapons, Skills & Testing](/systems/weapon-skills/).

### Test

Track only the resource bar for one attempt. If the dangerous attack arrives while a defensive reserve remains, the resource correction worked even if the attempt is not yet won.

## Damage and gear diagnosis

Gear becomes the primary problem only after the fight is mechanically stable.

### Strong evidence of a real gear problem

- common attacks are defended consistently;
- healing windows are reliable;
- the player reaches the same late phase repeatedly;
- the encounter fails because the safe strategy takes too long or allows too many unavoidable exchanges;
- the equipment is materially behind items and refinement levels available in the current progression range;
- a required resistance or socket function is clearly relevant and available.

### Weak evidence

- dying early to the same cue;
- being trapped at an edge;
- spending all stamina on offence;
- using an unfamiliar weapon because its displayed attack is higher;
- assuming a boss requires a rare build after only a few attempts.

Use [Gear, Refinement & Extraction](/systems/gear/) to decide whether to refine, change equipment or recover materials.

## Stun-gauge diagnosis

Official patches establish that:

- successful parries increase boss stun-gauge accumulation;
- a boss's stun gauge slowly recovers when the player leaves the combat area;
- bosses return quickly after leaving their intended area.

### If stun progress disappears

Check whether you:

- left the combat boundary;
- spent too long fully disengaged;
- stopped applying safe pressure;
- confused a phase or UI change with permanent gauge loss.

Do not remain in a losing position purely to preserve stun. Survival takes priority over partial progress.

## Group-encounter diagnosis

### If damage comes from off-screen

The group has surrounded you. Stop targeting one enemy as if it were a duel.

- move until enemies occupy one half of the screen;
- break ranged line of sight;
- use terrain to delay part of the group;
- take one local punish, then move again.

### If crowd control seems ineffective

Check:

- whether the correct weapon or skill state is active;
- whether the enemy is resistant or armoured during that action;
- whether the attack actually reaches all targets;
- whether the camera turned the action away from the intended area;
- whether a tool or secondary item changed the drawn slot.

### If one enemy is always the problem

Prioritise the **immediate threat**, not automatically the lowest-health target. An enemy controlling space, applying ranged pressure or interrupting healing can be more important than a nearly defeated target.

## Healing diagnosis

### Failed heal: no real window

If the enemy reaches you before healing completes:

- create more distance;
- use solid terrain;
- wait for a longer recovery;
- stop healing immediately after a panic dodge;
- preserve movement resources before the heal.

### Successful heal, immediate re-damage

The heal was executed, but position remained unsafe. Move or defend before resuming offence.

### Running out of healing

Determine whether items are compensating for:

- repeated unrecognised attacks;
- chip damage from holding block too long;
- environmental damage;
- an endurance problem caused by low damage;
- unnecessary healing at high health.

Only the final case is solved by carrying fewer or more items; the others require tactical or gear changes.

## The one-change protocol

After each attempt, choose exactly one change:

- camera/lock-on;
- arena route;
- response to one attack;
- shorter punish;
- larger resource reserve;
- one skill replacement;
- one equipment/refinement change;
- reload or technical workaround.

Then repeat the same encounter enough times to determine whether the change improved the relevant symptom.

## Attempt log

Use this compact record:

```text
Patch/platform:
Character and weapon:
Failure phase:
First major error:
Resource state:
Arena position:
Attack or cue involved:
Change for next attempt:
Result after change:
Possible known issue:
```

The log prevents random rebuilding and provides evidence for future guide corrections.

## Escalation path

1. Read [Combat Fundamentals](/systems/combat/).
2. Test the current weapon through [Weapons, Skills & Testing](/systems/weapon-skills/).
3. Apply one correction for three to five attempts.
4. Review [Gear, Refinement & Extraction](/systems/gear/) only if mechanics are stable.
5. Check [Patch Notes](/patch-notes/) and current known issues.
6. Report a reproducible defect with platform, patch, inputs and save state.

## Sources

- [Official Patch 1.00.03 — boss health, blocking, parry and stun changes](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=73)
- [Official Patch 1.06.00 — boss stun recovery, combat boundary and action fixes](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=90)
- [Official Patch 1.15.00](https://crimsondesert.pearlabyss.com/en-us/News/Notice/Detail?_boardNo=109)
- [Current known issues](https://crimsondesert.pearlabyss.com/en-US/News/Notice/Detail?_boardNo=68)
