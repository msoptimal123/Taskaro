# Design System

Pulled from the prototype's `C` color object and screen styling. Use these as `tailwind.config.ts` extensions.

## Colors

```ts
// tailwind.config.ts
export const colors = {
  // Type colors (Task / Deadline / Rezervacija)
  task: {
    DEFAULT: '#3B82F6',           // blue
    bg: '#EFF6FF',
    fg: '#1D4ED8',
  },
  deadline: {
    DEFAULT: '#D97706',           // warm orange (NOT red — user explicitly chose warmer)
    bg: '#FEF3C7',
    fg: '#92400E',
  },
  rezervacija: {
    DEFAULT: '#7C3AED',           // deep purple
    bg: '#F5F3FF',
    fg: '#5B21B6',
  },

  // Brand
  accent: '#C2692A',              // warm amber-brown for Uredi, links
  done: '#9CA3AF',
  green: '#16A34A',               // completion / success

  // Surfaces
  bg: '#F7F4F0',                  // warm off-white app background
  card: '#FFFFFF',
  border: '#EDE9E2',
  border2: '#F0EDE8',

  // Text
  text: '#1A1714',                // primary text
  muted: '#9B968F',
  muted2: '#6B6560',
};
```

## Typography

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }
.font-serif { font-family: 'DM Serif Display', serif; }
```

| Use | Font | Size | Weight |
|---|---|---|---|
| Greeting (Janez) | DM Serif Display | 30px | 700 |
| Screen titles (Taski, Projekti) | DM Sans | 22px | 700 |
| Card titles | DM Sans | 15-16px | 600 |
| Body text | DM Sans | 14-15px | 400-500 |
| Meta / muted | DM Sans | 12-13px | 400 |
| Section labels | DM Sans | 11px | 700, uppercase, letter-spacing 0.08em |
| Stat numbers | DM Sans | 22px | 700 |

Tracking: `-0.3px` to `-0.6px` for headings, normal for body.

## Spacing

Standard 4px scale. Common values used in prototype:
- `8px` — inline gaps
- `10-12px` — between cards in lists
- `14-16px` — card internal padding
- `20px` — screen horizontal padding
- `24px` — top of screens
- `100-120px` — bottom of scroll containers (clear of tab bar)

## Border radius

| Element | Radius |
|---|---|
| Buttons (default) | 12px |
| Cards | 14-16px |
| Pills / badges | 20px (full round on short content) |
| Type accent line | 2-3px |
| Circle (mic, complete, avatar) | 50% |

## Shadows

```css
/* Cards (subtle) */
box-shadow: 0 1px 3px rgba(0,0,0,0.04);

/* Cards on hover / elevated */
box-shadow: 0 2px 8px rgba(0,0,0,0.08);

/* Modal / dialog */
box-shadow: 0 8px 32px rgba(0,0,0,0.18);

/* Mic button (the hero) */
box-shadow: 0 4px 20px rgba(0,0,0,0.24), 0 1px 4px rgba(0,0,0,0.12);
```

## Components

### Bottom Tab Bar
6 items: Home (icon only), Taski, Kol., Projekti, Stranke, Notes.
- Icons: 20-22px, stroke 1.5px
- Inactive: `#B5B0A8`, Active: `#1A1714` + label weight 700
- Home tab: when active, show small dot below icon (no label)

### Voice FAB (mic button)
- 72×72px circle, dark gradient `linear-gradient(135deg, #1A1714 0%, #2D2520 100%)`
- White mic icon, 30×30px, stroke 1.6
- Pulsing ring border around it (`mic-idle-pulse` keyframe, 2.5s ease-out infinite)
- Position: inline on dashboard, centered, below the greeting

### Status badges
Pill-shaped, 12px font, 600 weight. Background + foreground from type colors above.

### Type accent line (left of task rows)
2-3px wide vertical line in the type color. Used everywhere a task appears (list, dashboard, project tasks).

### Dialogs (confirmation modals)
- Full-screen overlay: `rgba(26,23,20,0.45)`
- White rounded box, 20px radius, 24px padding
- Title: 17px bold, Body: 14px muted
- Two buttons: Cancel (gray) + Confirm (black)

### Toasts
- Bottom-center, fixed at 24px from bottom
- Background: `rgba(26,23,20,0.92)`, white text, 10×18px padding, 20px radius
- 2.2s auto-dismiss

### Completion burst (task done celebration)
- 8 colored particles fly out from center in 8 directions (45° apart)
- Center: large ✓ pops in (scale 0 → 1.3 → 1)
- Total duration: ~0.8s, removed after 1.8s

## Calendar specifics

| Element | Style |
|---|---|
| Day cell | 30×30 circle, centered |
| Today | gray background `#F0EDE8` |
| Selected | black background `#1A1714`, white text |
| Event dots | 4×4 colored dots below cell, max 3 |
| Day headers (P T S Č P S N) | 11px muted, 600 weight |

## Animation tokens

```css
@keyframes mic-idle-pulse {
  0%,100% { opacity: 0.3 }
  50%     { opacity: 0.8 }
}
@keyframes dot-bounce {
  0%,100% { transform: translateY(0) }
  50%     { transform: translateY(-6px) }
}
@keyframes pop-in {
  0%   { transform: scale(0);   opacity: 0 }
  60%  { transform: scale(1.3) }
  100% { transform: scale(1);   opacity: 1 }
}
```

Standard transition: `transition: all 0.15s` for UI states, `0.25-0.3s` for state changes (completion, toggles).
