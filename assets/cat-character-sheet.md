# Purrmission cat character sheet

This is the source brief for replacing the current CSS cats with consistent transparent sprite assets.

## Core identity

The Purrmission cat is a tiny financial-advisor companion: cute first, judgmental second. It should feel soft, clever, slightly smug, and emotionally reactive to the owner's spending behavior. It should not feel cruel, scary, or guilt-heavy.

## Visual rules

- Same cat in every state: same body proportions, fur color, eye shape, nose color, and markings.
- Rounded, compact silhouette with a readable face at small sizes.
- Expressive eyes and tail carry most of the emotion.
- Keep accessories minimal. If used, one tiny advisor cue is enough, such as a small collar charm shaped like a receipt or coin.
- Avoid realistic anatomy. The style should be app-icon cute, not photo-real.
- Avoid making bad states look like neglect. Low trust should read as suspicious, guarded, or restless, not harmed.

## Palette

- Main fur: warm golden cream.
- Inner ears / nose: soft paw pink.
- Shadow accents: muted caramel.
- Eyes / linework: dark plum.
- Optional highlight: mint for calm/good states, paw pink for stress/angry states.

## Sprite states

| State key | Product meaning | Pose direction | Expression | Motion notes |
| --- | --- | --- | --- | --- |
| `neutral` | Default, no strong judgment yet | Licking paws, loafing, or laying down napping | Calm, sleepy, mildly observant | Slow blink, tiny ear twitch |
| `happy_purring` | Owner listened, skipped, used purchase well, or has high trust/cozy | Happy cat, jumping, reaching toward user, or smiling while resting | Relaxed eyes, soft smile, upright tail | Purr bounce, cheek rub, reach paws forward |
| `skeptical` | Purchase is questionable, missing info, or needs pause | Sitting upright, leaning back slightly, thought cloud extending from head | Uneasy side-eye, raised brow, small frown | Thought bubble pulses, tail tip twitches |
| `angry` | User bought against warning or budget breach | Arched back, hair spikes, sharp tail, paws forward | Narrow eyes, tiny hiss mouth | Quick scratch, puff-up, hair spike shake |
| `stressed` | Low trust or high stress from repeated risky behavior | Constantly moving around, pacing, half-hiding, glancing at cart | Wide eyes, tense mouth, restless tail | Looping pace, peeking from edge, fidgeting |
| `zoomies` | Strong positive reinforcement, successful listen, joyful reward | Running in a circle or darting across screen | Excited, open smile, sparkly eyes | Fast dash, spin, tail trail |

## Required asset set

Create each state as transparent PNG or SVG.

- `cat-neutral.png`
- `cat-happy-purring.png`
- `cat-skeptical.png`
- `cat-angry.png`
- `cat-stressed.png`
- `cat-zoomies.png`

Recommended dimensions:

- Full sprite: `512x512`
- Small UI icon crop: `128x128`
- Keep all sprites centered on the same anchor point where possible.

## Interaction variants

The Cat Room needs three touch-reactive variants. These can be separate sprites or animation frames within `happy_purring`.

- `boop_head`: cat head reaches toward the user's touch point.
- `rub_body`: cat side/body presses into the touch point.
- `tail_brush`: tail sweeps into the touch point.

## Mapping to app states

| App state | Sprite state |
| --- | --- |
| Initial load | `neutral` |
| Purrmission granted | `happy_purring` |
| Purrhaps wait / missing info | `skeptical` |
| Needs serious inspection | `skeptical` or `stressed` |
| No purrmission | `skeptical` |
| I Purrchased It Anyway | `angry` |
| Budget breach | `angry` |
| Okay, I'll Listen | `zoomies` then `happy_purring` |
| Low trust / high stress Cat Care | `stressed` |
| Cat Room petting | `happy_purring` with interaction variant |

## Generation prompt seed

Use this prompt as the base for image generation or an illustrator brief:

> A consistent cute app mascot cat for a playful purchase-decision app, warm golden cream fur, dark plum eyes and linework, soft paw-pink nose and inner ears, rounded compact silhouette, expressive tail, tiny receipt-shaped collar charm, clean flat illustration, transparent background, mobile app sprite, soft but slightly judgmental personality, same character proportions across poses.

For each state, append the pose direction from the sprite state table.
