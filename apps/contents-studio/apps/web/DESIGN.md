# Marionette Studios — Design System

Confirmed by CTO review (2026-03-30). All components must conform to this spec.

---

## Color Tokens

```css
--color-bg:     #0A0A0A   /* page background */
--color-green:  #00FF41   /* running state, CTA, primary accent */
--color-red:    #C0392B   /* error state, destructive */
--color-white:  #F0F0F0   /* primary text */
--color-muted:  #707070   /* secondary / body text */
--color-subtle: #505050   /* disabled / inactive */
--color-border: #1E1E1E   /* default border */
```

## Typography

| Role      | Font       | Weight | Usage                    |
|-----------|------------|--------|--------------------------|
| Display   | Anton      | 400    | Page titles, hero text   |
| UI / Code | Geist Mono | 400–500| Labels, nav, body, tags  |

CSS variables: `--font-anton`, `--font-geist-mono`

No system fonts, no Inter, no Roboto.

---

## Agent / Pipeline Status

| State    | Dot color | Background | Text      | Border           |
|----------|-----------|------------|-----------|------------------|
| running  | #00FF41   | #00FF41/10 | #00FF41   | #00FF41/30       |
| queued   | #F59E0B   | #F59E0B/10 | #F59E0B   | #F59E0B/30       |
| complete | #484848   | #484848/20 | #F0F0F0   | #484848/40       |
| error    | #C0392B   | #1A0808    | #C0392B   | #C0392B/40       |
| idle     | #505050   | transparent| #707070   | #1E1E1E          |

Error state uses `#1A0808` background — near-black red tint.

---

## Shape & Spacing

- Border radius: **2px** (cards, badges, inputs) — sharp, not rounded
- Card padding: `16px`
- Section gap: `24px`
- Progress bar height: `2px`
- Status dot size: `6px` diameter

---

## Components

### StageCard / AgentCard
- Border: 1px `--color-border`, radius 2px
- Status dot (6px) + label in Geist Mono uppercase 10px
- Progress bar: `--color-green` fill, 2px height
- Running pulse: dot animates opacity 1→0.3→1

### StatusBadge
- Variant `pill`: border-radius 2px (overrides "pill" to stay sharp)
- Variant `tag`: same
- Text: Geist Mono, 11px, uppercase, tracking-wider

### Sidebar Nav
- Active: left 2px `--color-green` border + bg `#141414`
- Inactive: text `--color-muted`, hover text `--color-white`

---

## Responsive Scope

| Surface           | Mobile breakpoint |
|-------------------|-------------------|
| Homepage          | YES — 1-col services, scaled Anton, stacked team |
| Production Dashboard | NO — desktop only (1440px target) |

---

## Empty States (deferred to implementation)

To be defined per-component during feature development. Minimum requirements:
- Context sentence explaining why empty
- Primary action button
- No generic "No data" text
