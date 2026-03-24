---
title: No Hardcoded Numeric Values Except Safe Structural Ones
impact: CRITICAL
tags: values, numbers, hardcoding, magic-numbers
---

## No Hardcoded Numeric Values Except Safe Structural Ones

Every numeric value that a customer might want to tweak must be a variable. Hardcoded numbers are only acceptable when they're structural and changing them would break the widget.

See `val-safe-hardcoded` for the exhaustive allowlist of values that may stay hardcoded. If a value isn't on that list, it needs a variable.

**Incorrect (magic number in CSS):**

```css
.ais-AutocompletePanel {
  transform: scale(0.95) translateY(-8px);
}

.ais-AutocompleteDetachedSearchButtonQuery {
  line-height: 1.25em;
}
```

**Correct (variabilized):**

```css
.ais-AutocompletePanel {
  transform: scale(var(--ais-autocomplete-panel-open-scale))
    translateY(var(--ais-autocomplete-panel-open-offset));
}

.ais-AutocompleteDetachedSearchButtonQuery {
  line-height: var(--ais-autocomplete-detached-search-query-line-height);
}
```

**The test:** if you see a number in CSS that isn't in the `val-safe-hardcoded` allowlist, it needs a variable.
