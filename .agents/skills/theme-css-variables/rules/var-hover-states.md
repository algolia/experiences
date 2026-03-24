---
title: Use Same Color with Different Opacity for State Changes
impact: CRITICAL
tags: colors, hover, states, opacity
---

## Use Same Color with Different Opacity for State Changes

Hover, focus, and active states should modify opacity, not introduce new color variables. This keeps the palette minimal and ensures states feel cohesive with the base design.

**Incorrect (new color variable for hover):**

```css
.ais-AutocompleteNoResults-clear:hover {
  border-color: var(--ais-autocomplete-no-results-clear-hover-border-color);
}
```

**Correct (same color, different opacity):**

```css
.ais-AutocompleteNoResults-clear {
  border-color: rgba(
    var(--ais-autocomplete-no-results-clear-border-color),
    var(--ais-autocomplete-no-results-clear-border-opacity)
  );
}

.ais-AutocompleteNoResults-clear:hover {
  border-color: rgba(
    var(--ais-autocomplete-no-results-clear-border-color),
    var(--ais-autocomplete-no-results-clear-hover-border-opacity)
  );
}
```

**Exception:** When a hover state changes the color reference entirely (e.g., a muted icon becomes the text color on hover), that's a deliberate design decision, not a new variable:

```css
/* Muted color by default */
.ais-AutocompleteClearButton {
  color: rgba(
    var(--ais-autocomplete-form-clear-button-color),
    var(--ais-autocomplete-form-clear-button-color-alpha)
  );
}

/* Full text color on hover — reuses existing brand-level variable */
.ais-AutocompleteClearButton:hover {
  color: rgba(
    var(--ais-autocomplete-text-color),
    var(--ais-autocomplete-text-color-alpha)
  );
}
```

This exception only applies when switching to an existing brand-level variable. Never create a new color variable solely for a hover state.
