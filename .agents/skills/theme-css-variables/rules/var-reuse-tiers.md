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

1. **Brand consistency** — A color or transition that should feel uniform across the entire widget. These are brand-level variables — the variables in `variables.ts` that have no area prefix (e.g., `primary-color`, `text-color`, `background-color`, `transition-duration`, `base-unit`). Always check the current file for the authoritative list.

2. **Spatial alignment** — Two elements must stay aligned with each other. For example, `form-padding-left` is reused by the submit button and loading indicator because they must align with the form's left edge. If they had independent variables, a customer could accidentally break the alignment.

3. **Visual rhythm** — Elements within a group should have uniform spacing to form a visual pattern. For example, a gap variable shared between items in a list, where inconsistent spacing would look broken.

### Not a valid reason to reuse

- **Same value today** — Two things being `4px` doesn't mean they should change together.
- **Same CSS property** — Two elements both having `padding` doesn't mean they share a design decision.
- **Same area** — Being in the same functional zone (e.g., both in "items") doesn't justify sharing. The item's padding and the item icon's border-radius are unrelated decisions.
- **Same UI concept** — "All icons should be the same size" sounds reasonable but prevents customers from sizing form icons differently from item icons. Prefer per-area variables.
- **Convenience** — Fewer variables is not a goal. Clarity is.

### Tiers of sharing

When reuse is justified, it falls into one of two tiers:

**Tier 1 — Brand-level (shared across all areas):**
Global design decisions. These are the variables in `variables.ts` that have no area prefix (e.g., `primary-color`, `text-color`, `background-color`, `transition-duration`, `base-unit`). Always check the current file for the authoritative list.

**Tier 2 — Scoped (within one functional area):**
Prefixed by their area, only referenced within that area's CSS. Reuse within a scoped variable must still pass the "valid reasons" test above. Areas are defined by the `group` field in `variables.ts`.

### The test

Before reusing a variable, ask: **"If a customer changes this value, should both elements update?"** If the answer isn't a clear yes, create a new variable. Coupling through reuse is harder to undo than duplication.
