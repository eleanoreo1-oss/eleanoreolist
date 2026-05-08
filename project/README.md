# EDL Design System — Vision Concept

> **Internal team-aligned design system** combining the existing Disney **Enterprise Design Language (EDL)** with a futuristic, **liquid-glass** visual treatment. This is a *vision concept* — not the production EDL — intended for prototyping forward-looking internal tools.

---

## Source Material

| Source | Path / Link | Notes |
| --- | --- | --- |
| **EDL Component Library** (Figma) | mounted as virtual filesystem at `/` (read via `fig_*` tools) | 31 pages, 655 top-level frames, ~3700 components. The canonical EDL spec — typography, color, elevation, components |
| **EDL Cover** | `/Cover/Cover/index.jsx` (node `1301:3247`) | Brand sub-product: "Enterprise Design Language → Component Library" |
| **EDL Color Palette** | `/Color/EDL-Color-Palette/index.jsx` | Primary / Secondary / Semantic / Dark Mode ramps |
| **EDL Typography** | `/Typography/EDL-Typography/index.jsx` | Type ramp (T80 → T05) — InspireTWDC + MultiplaneTWDC Display + Roboto Mono |
| **Light/Dark Color Ramps** | `/Color/Light-Scheme-Color-Ramps/`, `/Color/Dark-Scheme-Color-Ramps/` | 13-step ramps with `$edl-color-*-95` token names |
| **Elevation** | `/Elevation/Type/`, `/Elevation/Usage-examples/` | Two levels: 30 (dropdowns/popovers) and 50 (toasts/modals). Light mode uses shadow, dark mode uses stroke |

---

## Product Context

**EDL** stands for **Enterprise Design Language** — an internal Disney design system used by employee-facing software and tooling teams. The brand mark on the Figma cover reads "Enterprise Design Language · Component Library" and ships as `v0.0.1` (last updated Sept 2, 2025).

The audience is **Disney internal employees** building tools for other Disney employees: deal management, customer files, proposal builders, dashboards, data tables — the kind of dense, function-first software that runs the studios, parks, and media businesses behind the scenes. Visual identity is restrained: indigo + neutral with semantic accents, heavy use of data tables, dropdowns, breadcrumbs, multi-segment controls, and a strong global navigation pattern. EDL is **not** consumer-facing Disney; there are no characters, parks photography, or Disney+ teal accents. It is a button-down **Disney Enterprise** look.

### The vision blend
This project remixes EDL with a **liquid-glass** aesthetic — translucent surfaces, blurred backgrounds, layered glass cards, soft refractive highlights — while preserving EDL's color tokens, type ramp, component vocabulary, and information density. Think *EDL components rendered behind frosted glass on a soft indigo gradient*.

---

## Repository Index

| File / Folder | Purpose |
| --- | --- |
| [`README.md`](./README.md) | This document |
| [`SKILL.md`](./SKILL.md) | Cross-compatible Agent Skill manifest |
| [`colors_and_type.css`](./colors_and_type.css) | All design tokens — color, type, spacing, elevation, glass |
| [`fonts/`](./fonts) | Web fonts (Google Fonts substitutes — see Caveats) |
| [`assets/`](./assets) | Logos, mark, illustrations, key imagery |
| [`preview/`](./preview) | Card files registered to the Design System tab |
| [`ui_kits/edl/`](./ui_kits/edl) | EDL UI Kit — recreated components + clickable prototype index |

---

## CONTENT FUNDAMENTALS

EDL copy is **direct, lowercase-friendly, sentence case, and operational**. It reads like internal tooling for adults who already know the domain.

- **Voice:** professional, second-person ("you"), action-led. "Save", "Edit", "Update request status", "Reach out to the designer to see how you can help!" The exclamation point is allowed but rare.
- **Casing:** **Sentence case** is the dominant convention for headers, buttons, table headers, and menu items. Uppercase is used only for tiny meta labels (badges like `ACTIVE`, micro-copy at 6–10px) and not for body content. Title Case is avoided.
- **Length:** Short. Buttons are 1–3 words ("Save", "Call to action", "Update request status"). Page titles are 1–3 words ("EDL Color Palette", "Elevation", "Typography"). Table cells are tight.
- **Emoji:** **None** in product UI. The Figma file contains zero emoji in component templates. Iconography is **Feather** + **Font Awesome 7 Pro** instead.
- **Tone:** matter-of-fact and helpful, never cheeky. From the Governance flowchart: "Let's talk about it!", "Awesome, use it!", "Nice! Reach out to the designer to see how you can help!" — friendly to designers/engineers using the system, but the *product UI* never speaks this way.
- **I vs You:** "**You**" in instructions ("Update request status"). First-person plural ("**we**") only in system-internal docs ("We have defined 10-step color ramps…").
- **Numbers & versions:** lower-case-prefixed (`v0.0.1`, `T30_Regular_Medium to Large Actions`). Token names use `$edl-color-{ramp}-{step}` and `T{nn}` for type.
- **Vibe:** Disney's enterprise side — corporate but human, clean, more **Confluence-meets-Linear** than Disney+ marketing. The liquid-glass treatment adds a sense of "internal tools getting a glow-up".

### Tagline-style examples (use as reference)
- "We have defined 10-step color ramps for a set of brand colors that are accessible and similar in contrast at each step."
- "Defines the various categories or styles of elevations. This section helps clarify the different variations available and when to use each one."
- "Items that take visual precedence and live above all content on the page, not having any relation to specific components on the page (ex: toasts, modals)"

---

## VISUAL FOUNDATIONS

### Colors
**Primary brand:** deep **indigo** `#3611C8` (the EDL signature — used for the cover banner, the elevation help-alert text, and primary buttons in the Promoted hierarchy). Paired with `#928AFF` (light indigo accent) and `#9747FF` (purple stroke) for layered violet moments.

- **Primary ramp** (Indigo) — 13 steps from `#F3F3FF` → `#000058`. Base = `#3611C8`.
- **Secondary ramp** (Blue) — 13 steps from `#F6FAFF` → `#000658`. Base = `#0072ED`.
- **Tertiary ramp** (Purple) — 13 steps from `#F9F3FE` → `#2E0059`. Base = `#7418C1`.
- **Neutral ramp** (Cool gray) — 13 steps from `#F7F9FA` → `#171C20`. Base = `#171C20`.
- **Semantic:** Success `#00C274`, Error `#C20031`, Warning `#FF8000`.
- **Decorative secondaries:** Aqua `#25D1F4`, Yellow `#FDBE00`, Pink `#EA04DF`.
- **Dark mode** flips the surface to neutrals `#171C20` / `#2E3841` and elevates with stroke (`#3A4652`) instead of shadow.

The vision blend introduces **glass tints** — translucent overlays of indigo-95 over a soft indigo-aqua gradient backdrop — for hero surfaces. Production EDL surfaces remain solid.

### Typography
- **Display:** `MultiplaneTWDC Display` (Disney's enterprise display face). Used for cover banners and largest titles (T80 = 60px, T70 = 42px, T60 = 38px). **Substituted** with `Outfit` (Google Fonts) — close in weight distribution and modern geometric character.
- **Body / UI:** `InspireTWDC` (Disney's enterprise text face). Used at T50 → T05 (30px down to 12px) across Heavy, Medium, Roman, Italic, Light, Black. **Substituted** with `Inter` (Google Fonts).
- **Mono:** `Roboto Mono` Regular/Medium/Bold @ 14px — used in tokens, code, table data. Available natively on Google Fonts.
- **Type ramp** (from EDL Typography spec):
  - **T80** 60px / Heavy — largest page titles
  - **T70** 42px / Heavy — secondary page titles, decorative quotes
  - **T60** 38px / Heavy — smallest page titles
  - **T50** 30px / Heavy — pattern title
  - **T40** 21px / Heavy — component title
  - **T30** 21px / Medium — medium-large actions
  - **T20** 21px / Roman — body, long-form
  - **T15** 16px / Medium — small actions, links (often underlined)
  - **T10** 12px / Roman — medium metadata
  - **T05** 12px / Heavy — small metadata, badges

### Spacing
- 4px base scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 88 / 118 / 160.
- Component padding usually `8px 12px` (small) or `12px 16px` (medium).
- Section gaps `24` and `32`. Page margins `56` and `120` on canvas.

### Elevation
Two levels — **strict and minimal**:
- **Elevation 30** — dropdowns, popovers. Soft shadow `0 2px 6px rgba(0,0,0,.1), 0 0 2px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.2)`.
- **Elevation 50** — toasts, modals. Stronger shadow `1px 2px 10px rgba(0,0,0,.2)`.
- **Dark mode** swaps shadow for a `1px solid rgb(58,70,82)` stroke.

The glass blend introduces a **third level**: **Glass** — `backdrop-filter: blur(40px) saturate(140%)` over `rgba(255,255,255,.55)` light or `rgba(23,28,32,.55)` dark, with a hairline `inset 0 0 0 1px rgba(255,255,255,.18)` highlight for refraction.

### Backgrounds
EDL itself is **solid white** or **#FBFBFB** — flat. The vision blend layers solid surfaces over a soft **indigo→aqua→pink gradient mesh** at 8–12% opacity, optionally with a subtle film grain at 3% opacity. No photography, no characters, no full-bleed imagery in product UI. Brand documents (cover frames) use **flat indigo** `#3611C8`.

### Animation
EDL doesn't specify motion in the Figma file — no easing tokens, no duration scale. The blend assumes:
- **Easing:** `cubic-bezier(.22,1,.36,1)` (out-expo) for entries, `cubic-bezier(.4,0,.2,1)` for transitions.
- **Durations:** 120ms (micro: hover), 180ms (small: dropdown open), 320ms (medium: modal). 
- **No bounce.** Glass surfaces fade-in from `blur(20px) opacity(0)` to `blur(40px) opacity(1)` for a refractive entrance.

### Hover / Press States (from `/Buttons/Light` spec)
- **Hover:** small ~5% darkening of fill, no scale.
- **Pressed:** ~10% darkening + slight inset shadow (no shrink — translation only on icon stacks).
- **Focused:** 2px outline using primary base + 2px offset.
- **Disabled:** 40% opacity, neutral-30 fill.
- The blend adds a **glass shimmer** on hover for primary CTAs — a 12% white sheen sweeping across the surface in 800ms.

### Borders & Corners
- **Border radii:** **8** (default for buttons, alerts, inputs, cards), **12** (large cards, color swatches), **16** (color ramp containers), **2** (fine spec dividers), **0** (data table rows). 
- **Borders:** **1px** solid for everything; **2px** only for editorial/section frames in the Governance page. Light borders use neutral-90 (`#E2E9EC`); dark borders use neutral-30 (`#3A4652`). Glass surfaces use `1px solid rgba(255,255,255,.18)` outer + 1px inner highlight.

### Transparency & Blur
- Used **sparingly** in production EDL: shadows at 8–25% black, sub-text colors at 70%.
- The vision blend uses transparency as a **first-class material**: glass cards, modal scrims at `rgba(23,28,32,.55) backdrop-blur(20px)`, navigation bars as glass.

### Imagery vibe
EDL has almost no imagery. When images appear (governance screenshots), they're **white-bordered with thin shadow** — like physical Polaroids. No grain, no filters, true color. The blend keeps imagery to a minimum and prefers gradient washes + glass layering as the visual interest.

### Cards
- **EDL card:** `12px` radius, `1px` neutral-90 border, white fill, **no shadow** at rest, optional Elevation 30 on hover. Padding `16-24px`.
- **Glass card (vision):** `16px` radius, glass-fill (see Elevation), `1px rgba(255,255,255,.18)` inset highlight, `1px rgba(0,0,0,.06)` outer hairline, padding `20-24px`.

---

## ICONOGRAPHY

EDL uses **Feather Icons** as its primary icon system. Every icon in the Figma file is namespaced `Feather-{Category}-{Name}` (e.g. `Feather-Arrows-Chevron-Down`, `Feather-User-Interface-Search`, `Feather-Privacy-Security-Shield`). There are ~200 unique icon SVGs covering Arrows, Camera/Photos, Commerce, Communication, Connectivity, Devices, Editing, Health, Home, Human, Indices, Keyboard/Code, Math/Data, Media, Objects/Tools, Privacy/Security, Shapes, Text Formatting, Time, Transportation, User Interface.

There is also a **Font Awesome 7 Pro** base component (`Iconography/FontAwesome-Base/`) used for a small set of heavier-weight icons (5 occurrences total) — primarily decorative and rarely used in product UI.

- **Format:** SVG icons, all 24×24 native (also rendered at 12 / 16 / 20). Stroke-based, 2px stroke, round caps, no fill.
- **Stroke vs fill:** **Stroke-only**, 2px, round-line-cap, round-line-join. Matches Feather's signature look.
- **Color:** inherits from text color via `currentColor`. Most often neutral-30/50, primary-50 for CTAs, semantic colors when used on alerts.
- **Emoji:** **never** used.
- **Unicode glyphs:** **never** used as icon substitutes.
- **No icon font:** Feather is shipped as individual SVGs, not a font.

**For this project:** rather than copying 200+ SVGs out of the Figma binary one-by-one, we link to **Feather Icons** via CDN (`https://cdn.jsdelivr.net/npm/feather-icons@4.29.2/dist/feather.min.js`). This is the canonical Feather library — same icons, same sizing. **No substitution flag needed** — it's the actual source set.

For decorative cover logo strokes (the 18-vector mark) we render an SVG mark (see `assets/edl-mark.svg`) — built from observation of the Cover frame.

---

## CAVEATS

- **Fonts are substituted.** `InspireTWDC` and `MultiplaneTWDC Display` are Disney-internal proprietary faces; we cannot redistribute them. We swap to **Inter** and **Outfit** from Google Fonts. Please drop real `.ttf`/`.woff2` files into `fonts/` and update `colors_and_type.css` if you have access.
- **Iconography** uses the Feather CDN (the actual upstream Feather library EDL is built from), so visually identical at 24px.
- **Motion specs are inferred** — the Figma file doesn't ship easing/duration tokens. If your team has real motion guidelines, please share.
- This is a **vision concept** — the liquid-glass treatments are *additive*, not part of canonical EDL.
