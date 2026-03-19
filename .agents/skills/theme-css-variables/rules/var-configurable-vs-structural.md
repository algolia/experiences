---
title: Only Variabilize Design Intent, Never Layout Mechanics
impact: CRITICAL
tags: variables, css, design-tokens, structure
---

## Only Variabilize Design Intent, Never Layout Mechanics

A CSS property becomes a variable when a customer might want to customize it as part of their brand or design. If changing the value would break the widget's layout or functionality, it stays hardcoded.

**Always a variable** (decorative / design intent):
- Colors, opacities, alphas
- Border widths, radii, opacities
- Spacing (padding, margins, gaps)
- Sizing (heights, widths of interactive elements)
- Typography (font-size, font-weight, line-height, letter-spacing, text-transform)
- Shadows
- Transition duration and timing function
- Z-index
- Configurable grid layouts (e.g., column sizes)

**Never a variable** (structural / layout mechanics):
- `display` (`flex`, `grid`, `none`, `block`)
- `flex-direction`, `flex-shrink`, `flex-grow`, `flex`
- `justify-content`, `align-items`
- `grid-auto-flow`
- `position` (`relative`, `absolute`, `fixed`, `static`)
- `overflow` (`hidden`, `auto`)
- `appearance` (`none`)
- `cursor` (`pointer`, `initial`)
- `text-align` (`left`, `center`)
- `text-overflow`, `white-space`
- `list-style`
- `pointer-events`
- `transform-origin`
- `font-family` (always `inherit`)
- `order` (DOM arrangement)
- `box-sizing`
- Resets (`border: 0`, `margin: 0`, `padding: 0`)

**Incorrect (variabilizing structural layout):**

```css
.ais-AutocompleteForm {
  display: var(--ais-autocomplete-form-display);
  flex-direction: var(--ais-autocomplete-form-direction);
  position: var(--ais-autocomplete-form-position);
}
```

**Correct (structural is hardcoded, design intent is variabilized):**

```css
.ais-AutocompleteForm {
  display: flex;
  position: relative;
  border-radius: var(--ais-autocomplete-form-border-radius);
  background-color: rgba(
    var(--ais-autocomplete-background-color),
    var(--ais-autocomplete-background-color-alpha)
  );
}
```

**The test:** ask "would a customer embedding this widget ever need to change this value to match their brand?" If yes, it's a variable. If no, it's structural.
