# Task: horizontal scrollbar in the collapsed (compact) menu

## Problem

In `data-nav="compact"` a small horizontal scrollbar appeared at the bottom of the
navigation column. Full mode looked fine.

## Root cause

Not the nav buttons — those were already clipped by `overflow: hidden` on
`nav[slot='navigation']`.

The culprit was `<div slot="navigation-header" style="padding: 1rem">Menu</div>`:

- compact column width = `3rem` = 48px
- inline `padding: 1rem` takes 16px on each side, leaving a **16px content box**
- the word "Menu" has a min-content width of **40.5px** and cannot break
- so the text ran from x=16 to x=56.5, i.e. 8.5px past the column's 48px edge

`wa-page` gives its internal `div[part=menu]` `overflow: auto` (so long nav lists can
scroll vertically), so that 8.5px of inline text overflow raised a horizontal scrollbar.
The header is a *sibling* slot of `navigation`, which is why the existing
`overflow: hidden` on `<nav>` never applied to it.

Measured evidence (compact, `part(menu)`): client 48px / scroll 57px.
Hiding the nav → still 57px. Hiding the navigation-header → 48px.

Note: `visibility: hidden` on the header does **not** fix this — the box is still laid
out and still contributes to the scroll area (measured: still 57px).

## Fix

- `index.html` — removed the inline `padding: 1rem` so CSS can override it.
- `src/index.css` —
  - `[slot='navigation-header']` gets its padding plus `overflow: hidden` / `nowrap`
    (root cause: the header now clips like the nav does).
  - compact mode hides the caption (`visibility: hidden`) so no half-clipped "Men".
  - `wa-page::part(menu) { overflow-x: clip }` as defense in depth, so any future
    slotted content that is wider than the rail cannot resurrect the scrollbar.

## Verification

`part(menu)` across repeated full ↔ compact toggles:

| mode | clientWidth | scrollWidth | h-overflow | scrollLeft after forcing to 999 |
|---|---|---|---|---|
| full | 240 | 240 | no | 0 |
| compact | 48 | 48 | no | 0 |

`scrollLeft` staying at 0 confirms the overflow is genuinely gone, not merely hidden
by the clip. No page-level horizontal scroll. Full mode unchanged (caption visible,
same 16px padding).

## Open / not done (flagged, not fixed — outside the reported bug)

At viewports below `mobile-breakpoint` the nav moves into a drawer, but the menu
column still reserves `--menu-width`. Measured at a 500px viewport: the menu box is
240px wide and `<main>` starts at x=240, so ~48% of the screen is dead space.

Vendor-documented fix, verified working here (menu box → 0px, main → x=0):

```css
wa-page[view='mobile'] {
  --menu-width: auto;
}
```
