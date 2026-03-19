---
title: Never Multiply or Divide a Variable by a Hardcoded Number
impact: CRITICAL
tags: values, calc, magic-numbers, coupling
---

## Never Multiply or Divide a Variable by a Hardcoded Number

When a `calc()` expression multiplies or divides a variable by a hardcoded number, it creates a hidden relationship. The customer has no way to know that one variable secretly controls another value at half or double its size.

**Incorrect (hidden halving relationship):**

```css
.ais-AutocompleteDetachedSearchButtonClear {
  padding: 0 calc(var(--ais-autocomplete-form-padding-right) / 2);
}
```

**Correct (dedicated variable):**

```css
.ais-AutocompleteDetachedSearchButtonClear {
  padding: 0 var(--ais-autocomplete-detached-clear-button-padding);
}
```

### The only allowed `calc()` pattern: `* 1px` for unit conversion

Variables store unitless numbers (e.g., `base-unit: 16`). CSS needs units. The `* 1px` pattern bridges this gap:

```css
font-size: calc(var(--ais-autocomplete-base-unit) * 1px);
```

This is a CSS mechanics pattern, not a design relationship — the customer sets `16`, and the CSS applies it as `16px`. This is the standard way to convert unitless variables to px (see `val-px-only`).

Any other arithmetic in `calc()` — dividing, multiplying by a number other than `1px`, subtracting — means you should create a dedicated variable instead.

**The test:** if removing the `calc()` and replacing it with a direct `var()` reference to a new variable would make the CSS clearer and give the customer more control, do it.
