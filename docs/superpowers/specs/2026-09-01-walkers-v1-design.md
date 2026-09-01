# Walkers Social Club New York: v1 Design

Date: 2026-09-01
Status: Approved by owner (pending final spec review)

## What this is

Walkers Social Club New York is a Saturday walking club for women in New York City, dogs optional. Members apply, get approved by hand, and see the walk's meet point in the app once it unlocks 24 hours before the walk. The club also sells a public line of apparel and accessories.

v1 is one codebase that ships two surfaces:

- An iPhone app (App Store name: "Walkers Social Club", clear as of 2026-09-01)
- A website at walkerssocialclub.com (available as of 2026-09-01; walkers.nyc optional secondary)

## Source of truth for the visuals

The design handoff bundle at `~/Downloads/design_handoff_walkers_app/` (copy it into this repo under `design/` before building):

- `README.md`: full token, type, spacing, and screen spec. Build from prototype option 5a.
- `Walkers NYC.dc.html`: interactive design document with the prototypes.
- `Walkers Brand Summary.dc.html`: brand identity summary.

Key rules from the handoff: club blue `#4B77AB` and cream `#F4F1E8` carry everything; Nunito 800 lowercase headings, Georgia body, DM Mono labels; border radius 0 everywhere except avatars and 2px button corners; no shadows; the striped-heading motif is a reusable component; the running dog is a single swappable SVG asset (redraw pending); all photos are placeholder containers at documented aspect ratios.

**One change to the handoff:** the club renamed from "wellness club" to "social club" on 2026-09-01. The wordmark's second line, app header, and all copy say "social club". Everything else in the handoff stands.

## Mission copy (owner addition)

The inclusive-but-safe positioning is stated explicitly, woven into existing copy rather than a standalone mission section:

- Website, public block under the premise, with the stripe motif heading `everyone's welcome to apply`: "We're building an inclusive community of women who walk. We review every application by hand and keep the group small on purpose: it's how we keep every walk safe and friendly."
- App splash, HOW IT WORKS block: "Everyone's welcome to apply. Every member is approved by hand, and we cap each walk so it stays small. Once you're in, the meet point lands in the app 24 hours before we walk."

No em dashes anywhere in copy, code comments, or docs (owner rule).

## Architecture

- **Frontend:** Expo (React Native) with Expo Router. One codebase builds the iOS app and the website (Expo web, deployed to Vercel).
- **Backend:** Supabase. Postgres for data, Supabase Auth for accounts, Storage for recap and product photos.
- **Payments:** Stripe Checkout (hosted page). Physical goods, so no Apple in-app purchase requirement and no Apple fee.
- **Email:** Transactional email (approval and decline notices, order confirmations come from Stripe). Provider chosen at implementation time; Resend is the default candidate.

## Member journey

Screen flow is a straight line, then tabs: `welcome -> apply -> pending -> home (4 tabs)`.

1. **Splash / Welcome.** Club premise, mission line, "request to join" button, "already a member? sign in" link.
2. **Application.** First name, Instagram handle (required, leading @ stripped), dog toggle with conditional cream dog panel (dog name, breed, size), "why do you want to walk with us" textarea. Submitting creates a Supabase account keyed to their email so status follows them across devices. Validation is inline in cream, never red on blue: first name and handle required; dog name required when "yes, I have a dog" is selected.
3. **Pending.** Three-step hand-review explanation. The screen reads real membership status from the server (poll or realtime subscription). The prototype's demo approve button is removed.
4. **Approved.** Member gets an email. App opens into the four tabs:
   - **walks** (default): this Saturday's walk card (name, time, pace, distance, headcount, dog count), the meet point (locked or unlocked), RSVP button, merch-box note, coffee stop, house rules.
   - **recaps:** last walk's photo grid and short member notes.
   - **shop:** see Shop section.
   - **you:** member card, stats strip (walks, miles, cafes), dog card, settings list.

Tab bar is text-only (no icons, identity decision), hidden during the pre-approval flow.

### Meet point lock

Server-decided, never client-decided. The API returns the meet point only when both are true: the member is approved, and the current server time is past the walk's reveal timestamp (Friday 9:00 am for a Saturday walk). The locked state shows the dashed card with blurred placeholder text. A changed phone clock cannot reveal it.

### RSVP vs reveal

The prototype's single toggle button splits into two concerns: RSVP is a member action ("count me in for saturday"), the reveal is time-gated and server-controlled. Both visual states from the handoff are kept.

## Shop

Real selling in v1. This diverges from the handoff (which shows "coming soon") by owner decision on 2026-09-01.

- Products live in a Supabase `products` table: name, description, price, sizes, photos, active flag, and a `club_only` flag.
- Public sale line: anyone can buy. On the website the shop page is public with no sign-in needed, since selling is a primary purpose. In the app the shop tab appears for approved members per the handoff layout.
- Buying opens Stripe Checkout (hosted). Stripe collects shipping address. A Stripe webhook (Supabase Edge Function) records the order in an `orders` table on `checkout.session.completed`.
- Club-only walk-box pieces are listed but not purchasable, with the handoff's copy: "The pieces in the walk box are club-only. You can't buy them: you show up early."
- Fulfillment is manual for v1: owner ships from the Stripe dashboard order list. No inventory automation.

## Admin

A hidden `/admin` route on the website, visible only to the owner's account (checked server-side by user id, not hidden client-side only). Two jobs in v1:

1. **Applications.** List of pending applications showing all answers and a link to the applicant's Instagram. Approve and Decline buttons update `membership_status` and send the corresponding email.
2. **Walks.** Create and edit the upcoming walk: name, date, time, pace, distance, meet point text, reveal timestamp, coffee stop (name, address, perk, photo), and expected headcount and dog count.

Seeded from the database in v1 (admin UI can come later): recap photos and notes, product rows.

## Data model (Supabase)

- `profiles`: user id, first name, instagram handle, membership_status (none / pending / approved / declined), has_dog, dog_name, dog_breed, dog_size, why, created_at. Row-level security: members read their own row; owner reads all.
- `walks`: id, walk_number, name, date, time, pace, distance, meet_point, reveal_at, coffee_stop fields, headcount, dog_count.
- `rsvps`: walk id, user id, created_at.
- `recaps`: walk id, photo paths, captions; `recap_notes`: walk id, user id or name, handle, quote.
- `products`: as described in Shop; `orders`: stripe session id, line items, status.

Meet point protection: `meet_point` is excluded from the anon and member read policies; a Postgres function or Edge Function returns it only when status and time checks pass.

## Out of scope for v1 (deliberate)

Push notifications (email only), bring-a-friend, in-app reporting flow, member-editable dog chips, inventory management, recap upload UI, decline appeal flow. The running-dog redraw and real photography are content tasks, not build tasks; the build uses the swappable placeholder SVG and striped placeholder image containers.

## Error handling

- Form validation inline per the handoff (cream text with mono labels).
- Application submit failures keep the user's answers and show a retry.
- Stripe webhook failures: Stripe retries automatically; orders reconcile from the Stripe dashboard.
- Meet point requests before unlock return the locked state, not an error.

## Testing

- Unit tests for the reveal logic (status x time matrix) and application validation.
- End-to-end pass before launch with a throwaway account: apply, see pending, approve via /admin, receive email, see the walk, RSVP, see the meet point unlock after the reveal time (tested by setting reveal_at in the past).
- Stripe test mode for the full checkout and webhook path.
- Runs in iOS simulator and browser throughout development.

## Owner action items (not build tasks)

- Buy walkerssocialclub.com (and optionally walkers.nyc).
- Create the Stripe account for the club (or a new product line under an existing one).
- Commission the running-dog vector redraw; supply real product and recap photography when ready.
