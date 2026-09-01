# Handoff: Walkers Wellness Club — iPhone app

## Overview

Walkers Wellness Club New York is a weekend walking club for women in their twenties and thirties in New York City. The app is the front door: prospective members apply, get approved by hand, and then see the upcoming Saturday walk — including a meet point that only unlocks 24 hours before the walk. Walks are two easy miles, dogs optional, and end at a different West Village coffee shop each week. A box of club merch comes to each walk for the earliest arrivals.

The app in this handoff covers seven screens across two states: an unapproved applicant flow, and an approved member experience behind a four-tab bar.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy. `Walkers NYC.dc.html` is a design document containing several rounds of logo exploration plus two full app prototypes; **build from option 5a in the section labelled `t5`** (the blue-and-cream prototype). Option 1b in section `t1` is an earlier navy/ecru version, superseded — reference it only for comparison.

The task is to recreate the 5a screens in the target environment using its established patterns. If the target is a native iOS app, SwiftUI is the natural choice; if it's React Native or a web app, use the codebase's existing component library and styling approach. Do not ship the HTML.

`Walkers Brand Summary.dc.html` is the brand identity document — positioning, palette, type, and open items.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and copy are final enough to build against. Recreate the UI faithfully. Two exceptions:

- **The running dog** is a geometric placeholder assembled from SVG ellipses and rounded bars. It appears in the wordmark, the splash, the header, and the dog profile card. It is **not** final artwork — a vector artist is redrawing it. Build it as a single swappable asset (one SVG/image referenced everywhere) so the redraw is a one-file change.
- **All photography** is a striped placeholder. Build real image containers at the documented aspect ratios with a placeholder fill.

## Design tokens

### Colors

| Token | Hex | Use |
|---|---|---|
| `clubBlue` | `#4B77AB` | Primary app background |
| `deepBlue` | `#3D6494` | Buttons on cream, headings on cream, unlocked-state fills |
| `cream` | `#F4F1E8` | All type on blue; card backgrounds |
| `sand` | `#DCD6C8` | Desk/canvas background outside the phone (not used in-app) |
| `ink` | `#22364F` | Body type on cream; device bezel |
| `chalkRed` | `#C4362B` | Patch border and dog silhouette in the patch lockup only — **not used in the app** |
| Placeholder stripe A | `#E2DDCE` | Image placeholder, 135° stripe |
| Placeholder stripe B | `#EDE8DA` | Image placeholder, alternating stripe |

Opacity ramp used on cream over blue: `1.0` primary, `0.92`/`0.9` body, `0.85`/`0.8` secondary, `0.75` tertiary, `0.5` inactive tab, `0.45`/`0.4` borders, `0.3`/`0.25` hairlines.
Opacity ramp for ink over cream: `1.0` headings, `0.85`/`0.8` body, `0.7` labels; `deepBlue` at `0.35`/`0.3`/`0.25` for rules and dividers.

### Typography

| Family | Weights | Use |
|---|---|---|
| Nunito | 800 (600/700 available) | Wordmark, all screen headings, buttons, tab labels, names, stat numbers. Always **lowercase**, `letter-spacing: -0.035em` to `-0.04em` at display sizes, `-0.02em` at 16–18px. |
| Georgia (serif) | 400 | All body copy, taglines, list rows, testimonials. `line-height: 1.55–1.65`. |
| DM Mono | 400, 500 | Uppercase labels, times, metadata, status lines. `letter-spacing: 0.14em–0.24em`. |

Type scale in use, by role:

- Splash wordmark lines: 38px/0.88, Nunito 800
- Screen heading: 32–36px/0.9, Nunito 800
- Card heading (walk name): 36px/0.9, Nunito 800, `deepBlue`
- Sub-card heading ("for the early ones", "the dog"): 24–26px/1, Nunito 800
- Body: 14–16px/1.55–1.65, Georgia
- Button label: 14–15px/1, Nunito 800
- Metadata value: 15px/1, Nunito 800
- Metadata label: 8–9px/1, DM Mono 500, tracked 0.2–0.24em, uppercase
- Tab label: 11px/1, Nunito, 800 active / 600 inactive
- Status bar: 11px/1, DM Mono 500

### Spacing and geometry

- Screen horizontal padding: 22px (24px on splash, application, pending)
- Vertical stack gap between blocks: 20px; within a card: 16–18px; tight pairs: 6–9px
- Card padding: 22px 20px (walk card, merch card, dog card); 14px (coffee-stop row, image rows); 16px (inset notes)
- **Border radius: 0 everywhere.** Squared corners are a deliberate part of the vintage direction. The only rounded elements are avatars/photo circles (`50%`), the 2px-radius button corners, and the device bezel itself.
- Borders: 1.5px solid `cream @ 0.4–0.45` on blue; 1.5px solid `deepBlue @ 0.35` on cream; 1.5px **dashed** for the locked and demo states
- Hairline dividers in lists: 1px `cream @ 0.25`
- No shadows anywhere inside the app. (The only shadow in the file is the mock device's drop shadow.)

### The stripe motif

The signature graphic device. A horizontal stripe field fills the remaining width beside a heading line:

```
repeating-linear-gradient(cream 0 2px, transparent 2px 6px)
```

2px stripe, 4px gap. Height is 20–26px depending on the heading size, vertically centered against the text, separated by a 6–7px gap. On cream backgrounds the stripe color is `clubBlue`. Used on: every splash wordmark line, screen headings, the walk card's first line, the "tell us" heading, the pending-screen name line, and the "the dog" divider. Implement as a reusable `StripedHeading(text, stripeHeight)` component — it appears more than a dozen times.

Two diagonal texture overlays sit on the splash screen only, at very low opacity, to suggest garment weave:

```
repeating-linear-gradient(45deg,  rgba(0,0,0,0.04) 0 1px, transparent 1px 3px)
repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)
```

## Screens

Device frame in the mock is 392×812pt with a 44pt status bar and a 22pt home-indicator strip. Build to standard iPhone safe areas.

### 1. Splash / Welcome

**Purpose:** State what the club is and route to the application.

Full-bleed `clubBlue` with the diagonal texture overlay. Content is a space-between column: top group holds the three-line wordmark (`walkers` / `wellness club` / `new york`, each followed by a stripe field, the dog SVG 60pt wide at the end of the third line), the serif tagline `Est 2026 · Dog Walk Social Club` at 14px, and a 16px/1.6 Georgia paragraph at max-width 300pt:

> A weekend walking club for women in New York. Bring your dog, or just bring yourself. We finish at a new coffee shop every time.

Bottom group: a "HOW IT WORKS" block with 1.5px cream rules above and below, 16pt padding, containing —

> Every member is approved by hand. Once you're in, the meet point lands in the app 24 hours before we walk.

— then a full-width cream button, `deepBlue` label, 18pt padding, 2pt radius: **request to join**. Below it a borderless text button: **already a member? sign in** (12px Nunito 600, cream @ 0.8). In the prototype that second button jumps straight to the approved Walks screen; in production it opens sign-in.

### 2. Application

**Purpose:** Collect name, Instagram handle, dog details, and motivation.

Blue background, 24pt padding, 22pt gaps. A `← BACK` mono button at top left. Heading is two lines: `tell us` (with stripe field) / `about you`, then:

> Takes two minutes. We read every one of these — it's how we keep the group small and safe.

**Fields**, each a 9px DM Mono uppercase label tracked 0.22em above a bottom-bordered transparent input (1.5px cream @ 0.5, 16px text, cream, 9pt vertical padding):

1. `FIRST NAME` — placeholder "Maya"
2. `INSTAGRAM HANDLE · REQUIRED` — a fixed `@` prefix at 16px DM Mono, cream @ 0.6, sits inside the border with the input. Helper below: "We check it so everyone on the walk is a real person. Private accounts are fine."
3. `BRINGING A DOG?` — two equal-width segmented buttons, 8pt gap: **yes, I have a dog** / **just me**. Selected: cream fill, `deepBlue` label, 1.5px cream border. Unselected: transparent fill, cream label, 1.5px cream @ 0.4 border. 13px Nunito 800, 13pt padding, 2pt radius.
4. **Dog panel** — conditional, only when "yes" is selected. A cream-filled inset (18pt padding, 16pt gaps) that inverts the palette: `deepBlue` labels, `ink` inputs, `deepBlue @ 0.45` bottom borders, `clubBlue` stripes. Header row is `the dog` (24px Nunito 800, `deepBlue`) + stripe field + the dog SVG at 38pt. Contains `DOG'S NAME` (placeholder "Miso"), `BREED / MIX` (placeholder "Corgi mix"), and `SIZE` as three segmented buttons — Small / Medium / Large, 10px DM Mono tracked 0.08em, selected fills `#223A63`. Footer: "Two miles at an easy pace, leashed the whole way. Tell us if yours is nervous around other dogs."
5. `WHY DO YOU WANT TO WALK WITH US?` — a 4-row textarea, non-resizable, 1.5px cream @ 0.45 border, `cream @ 0.08` fill, 11pt padding, 15px text. Placeholder: "Moved here in March and I'm looking for a Saturday routine…" Helper: "A sentence is plenty. There's no wrong answer."

Submit: full-width cream button, **send application**. Below, centered 11px mono: "Your answers stay with the two of us who run the club."

**Validation to add in production** (not in the mock): first name and Instagram handle required; handle stripped of a leading `@`; if "yes, I have a dog" is selected, dog name is required. Show errors inline under the field in `cream` with a mono label; do not use red on blue.

### 3. Pending

**Purpose:** Confirm receipt and set the expectation of hand review.

Blue, space-between column. `APPLICATION RECEIVED` mono label, then a two-line heading: `thanks,` / `{firstName}` + stripe field (falls back to "Maya" when empty). Body:

> One of us reads every application by hand, usually within a couple of days. We'll check your Instagram, say hi, and send the walk details once you're in.

A three-row numbered list, 1.5px cream rule above and 1px cream @ 0.25 between rows. Row 1 is at full opacity (current step), rows 2 and 3 at 0.6/0.75:

1. `01` — We review your answers and your handle
2. `02` — You get a note from us, and the house rules
3. `03` — Meet point unlocks 24h before the walk

At the bottom, a dashed **DEMO: APPROVE ME →** button. **Remove this in production** — it exists only to let the prototype cross into the approved state. Real approval arrives out of band (push notification / email), and this screen should poll or subscribe for status.

### 4. Walks (tab 1, default after approval)

**Purpose:** The one screen a member opens on a Saturday morning.

Header row: the dog SVG at 36pt beside `walkers wellness club` (16px Nunito 800, cream), and a 30pt circular cream avatar showing the member's initial in `deepBlue`.

**Walk card** — cream fill, 22×20pt padding:
- Row: `THIS SATURDAY` (mono, `deepBlue`) and `WALK NO. 07` right-aligned
- Heading: `hudson` + stripe field / `river loop`, 36px Nunito 800 `deepBlue`
- Body: "Two easy miles along the water, finishing for coffee in the West Village."
- A three-column metric strip with 1.5px `deepBlue @ 0.35` rules above and below and 1px vertical dividers: **TIME** 9:30 am · **PACE** easy · 2 mi · **WALKING** 18 · 11 dogs
- **Meet point**, two states:
  - *Locked* (default): 1.5px dashed `deepBlue @ 0.5` border, no fill. `MEET POINT · LOCKED`, the address at 18px Nunito 800 `deepBlue` with a **5px blur** and `user-select: none`, then "Unlocks Friday at 9:00 am, for approved members only."
  - *Unlocked*: solid `clubBlue` fill, cream type. `MEET POINT · UNLOCKED`, "Pier 45 lawn — Christopher St & West St", then "Look for the cream tote. We leave at 9:40 sharp."
- CTA: full-width `deepBlue` button, cream label. Reads **count me in for saturday** when locked, **you're in — see you saturday** when unlocked. In the prototype this button toggles the reveal so the state can be demoed; **in production RSVP and meet-point reveal are separate concerns** — RSVP is a member action, the reveal is time-gated (Friday 9:00am) and server-controlled. Keep the two visual states, split the trigger.

**Merch card** — no fill, 1.5px cream @ 0.45 border, 18×20pt padding. `A LITTLE SOMETHING` mono label, `for the early ones` at 26px Nunito 800, then:

> We bring a box of club merch to every walk — sweatshirts, caps, totes, bandanas for the dogs. First to arrive, first to take one home. That's all we'll say.

Deliberately has no counter, no claim button, and no countdown.

**Coffee stop** — label row `THE COFFEE STOP` / `NEW EVERY WEEK`, then a cream row (14pt padding) with a 74×74 image placeholder and, beside it, `Sey · Bedford St` (17px Nunito 800 `deepBlue`) and "Dogs welcome on the bench outside. 10% off with the club."

**House rules** — 1.5px cream rule above, `HOUSE RULES` mono label, then:

> Women only. Leashes on. No photos of anyone who hasn't said yes. Tell us if something feels off and we'll handle it.

### 5. Recaps (tab 2)

Heading `last` + stripe / `saturday`. A photo grid: one full-width 170pt tile (2-col span), then two 118pt tiles side by side, 8pt gaps. Each carries a mono caption in the mock describing the intended shot (group shot at Pier 45; dogs at the coffee stop; merch box, candid) — replace with real images.

Below, member notes: a 26pt cream circular avatar with the initial in `deepBlue`, the name at 13px Nunito 800, the handle at 11px DM Mono cream @ 0.7, then a 14.5px Georgia quote. Two entries, separated by a 1px cream @ 0.3 rule.

### 6. Shop (tab 3)

Heading `the shop` + stripe, then "In the works. Members get first look, and the walk box comes out of the same run."

A 2×2 grid, 14pt gaps. Each cell: a 1:1 image placeholder, the product name at 14px Nunito 800 cream, and `COMING SOON` at 10.5px DM Mono cream @ 0.75. Products: Club Crewneck (blue/cream), Walkers Cap (cream/blue), Saturday Tote (cream/blue), Good Dog Bandana (blue/cream).

Footer note on cream: `NOT FOR SALE` mono label in `deepBlue`, then "The pieces in the walk box are club-only. You can't buy them — you show up early."

### 7. You (tab 4)

Header: a 62pt circular photo placeholder, the first name at 26px Nunito 800, `@handle` at 11.5px DM Mono, and `APPROVED MEMBER` at 8.5px DM Mono tracked 0.2em.

**Stats strip** — cream fill, three equal cells with 1px `deepBlue @ 0.25` dividers: **6** WALKS · **13** MILES · **4** CAFÉS. Numbers 24px Nunito 800 `deepBlue`, labels 8px DM Mono.

**Dog card** — 1.5px cream @ 0.45 border, 20pt padding. Header row: `the dog` + stripe field + `NO. 07B`. Then a 70pt circular photo placeholder beside the dog's name (24px Nunito 800) and `{breed} · {size}` in Georgia. Below, three mono chips with 1px cream @ 0.55 borders: `GOOD WITH DOGS`, `EASY PACE`, `CAFÉ TRAINED`. (Chips are static in the mock; decide whether they're member-set or admin-set.)

**Settings list** — 1.5px cream rule above, rows separated by 1px cream @ 0.25, each 15pt vertical padding, 14.5px Georgia cream: Edit my details · House rules · Report something · Bring a friend (she'll be reviewed too) — the last at 0.75 opacity. All four are unbuilt destinations.

### Tab bar

Four tabs, equal width, on the blue background with a 1.5px cream @ 0.4 top rule: **walks · recaps · shop · you**. Labels only — no icons, by design. Active: cream at full opacity, Nunito 800, with a 2.5px solid cream top border sitting over the rule. Inactive: cream @ 0.5, Nunito 600, transparent top border. Hidden entirely during the splash/application/pending flow.

## Interactions and behavior

- **Navigation** is a single screen enum, no stack: `welcome → apply → pending → home`, then free movement between the four tabs. Back from `apply` returns to `welcome`.
- **No animations or transitions** are specified in the mock. If the target platform has native push/tab transitions, use them; do not add custom motion. The one place motion would help is the meet-point reveal — a short cross-fade from the blurred locked state to the filled unlocked state.
- **The dog panel** appears and disappears based on the dog toggle. Selecting "just me" clears dog name, breed, and size.
- **Hover states** are not defined (touch target). Provide standard platform press states; keep them subtle — an opacity dip rather than a color change.
- **Hit targets**: all buttons in the mock are 44pt or taller. Keep that floor, especially on the segmented size buttons.
- **Empty/fallback values**: name falls back to "Maya", handle to "mayawalks", dog name to "Miso", breed to "Corgi mix", size to "Small". These are prototype placeholders — in production show real empty states or require the fields.

## State

| State | Type | Notes |
|---|---|---|
| `screen` | enum | `welcome` `apply` `pending` `home` `feed` `shop` `profile` |
| `firstName` | string | |
| `instagramHandle` | string | leading `@` stripped on input |
| `hasDog` | bool? | null until answered — drives the dog panel |
| `dogName`, `dogBreed` | string | |
| `dogSize` | enum? | Small / Medium / Large |
| `why` | string | |
| `meetPointRevealed` | bool | **server-driven** in production: true once the walk is inside 24h and the member is approved |
| `membershipStatus` | enum | none / pending / approved — replaces the demo approve button |

Data the app needs from a backend: the upcoming walk (name, date, time, pace, distance, headcount, dog count, meet point, reveal timestamp), the coffee stop (name, address, photo, perk), the last walk's recap (photos and member notes), the shop list, and the member's own profile and stats.

## Assets

- **Running dog silhouette** — inline SVG, `viewBox="0 0 124 84"`, single fill color, currently drawn from four ellipse/rect groups. Placeholder pending vector redraw. Appears at 36pt (header), 38pt (dog panel), and 60pt (splash), always in cream on blue or `clubBlue` on cream.
- **Photography** — none yet. Placeholders are 135° two-tone stripe fills; sizes are documented per screen above.
- **Fonts** — Nunito and DM Mono are on Google Fonts. Georgia is a system serif on iOS and macOS; if the target platform lacks it, substitute a transitional serif with similar weight (not a display serif).
- **No icon set is used.** If the platform pushes toward tab icons, discuss before adding — the text-only bar is an identity decision.

## Files in this bundle

- `Walkers NYC.dc.html` — the design document. **Build from option `5a` in section `t5`.** Sections `t4`, `t3`, `t2` are logo explorations; `t1` holds the superseded first app pass (`1b`) and the first identity system (`1a`).
- `Walkers Brand Summary.dc.html` — brand identity summary: positioning, palette, type, app structure, open items.
- `doc-page.js` — supporting file for the brand summary document only. Not part of the app.

Open these in a browser to see the designs rendered. The prototypes are interactive — tap through them.
