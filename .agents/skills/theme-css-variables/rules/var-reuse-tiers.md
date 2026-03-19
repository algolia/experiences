---
title: Default to No Reuse; Share Only With Good Reason
impact: CRITICAL
tags: variables, reuse, coupling, design-tokens
---

## Default to No Reuse; Share Only With Good Reason

Variable reuse creates coupling. The default is to **not reuse** — every CSS declaration gets its own variable unless there's a specific reason to share.

### The default: one variable per declaration

Even within the same functional area, don't share a variable between two declarations just because they happen to have the same value today. Padding on an item is not the same design decision as margin on a button inside that item, even if both are `4px`.

**Incorrect (sharing within an area without reason):**

```css
.ais-AutocompleteIndexItem {
  padding: var(--ais-autocomplete-item-padding);
}

/* item-padding is for the item's inner spacing, not for button margins */
.ais-AutocompleteItemActionButton svg {
  margin: var(--ais-autocomplete-item-padding);
}
```

**Correct (dedicated variable for each purpose):**

```css
.ais-AutocompleteIndexItem {
  padding: var(--ais-autocomplete-item-padding);
}

.ais-AutocompleteItemActionButton svg {
  margin: var(--ais-autocomplete-item-action-icon-margin);
}
```

### Valid reasons to reuse

Reuse is justified only when the two declarations share a **design intent** — meaning a customer changing the value would expect both to update. Here are the valid reasons:

1. **Brand consistency** — A single color, transition, or icon size should feel uniform across the widget. These are the brand-level variables: `primary-color`, `text-color`, `background-color`, `border-color`, `muted-color-alpha`, `icon-size`, `icon-stroke-width`, `transition-duration`, `transition-timing-function`, `base-unit`.

2. **Spatial alignment** — Two elements must stay aligned with each other. For example, `form-padding-left` is reused by the submit button and loading indicator because they must align with the form's left edge. If they had independent variables, a customer could accidentally break the alignment.

3. **Visual rhythm** — Elements within a group should have uniform spacing to form a visual pattern. For example, a gap variable shared between items in a list, where inconsistent spacing would look broken.

4. **Same UI concept** — The variable describes a single concept that manifests in multiple places. For example, `icon-size` applies to all SVG icons because they are the same concept ("how big are icons in this widget"), not because they happen to share a value.

### Not a valid reason to reuse

- **Same value today** — Two things being `4px` doesn't mean they should change together.
- **Same CSS property** — Two elements both having `padding` doesn't mean they share a design decision.
- **Same area** — Being in the same functional zone (e.g., both in "items") doesn't justify sharing. The item's padding and the item icon's border-radius are unrelated decisions.
- **Convenience** — Fewer variables is not a goal. Clarity is.

### Tiers of sharing

When reuse is justified, it falls into one of two tiers:

**Tier 1 — Brand-level (shared across all areas):**
Global design decisions. The exhaustive list of brand-level variables:

- `primary-color` + `primary-color-alpha`
- `text-color` + `text-color-alpha`
- `background-color` + `background-color-alpha`
- `border-color`
- `muted-color-alpha`
- `icon-size`, `icon-stroke-width`
- `transition-duration`, `transition-timing-function`
- `base-unit`

**Tier 2 — Scoped (within one functional area):**
Prefixed by their area, only referenced within that area's CSS. Reuse within a tier 2 variable must still pass the "valid reasons" test above.

- `form-*`, `panel-*`, `item-*`, `header-*`, `no-results-*`, `detached-*`, `scrollbar-*`

### The test

Before reusing a variable, ask: **"If a customer changes this value, should both elements update?"** If the answer isn't a clear yes, create a new variable. Coupling through reuse is harder to undo than duplication.
