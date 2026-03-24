---
title: No rem, No em; Always px for Dimensions
impact: CRITICAL
tags: units, px, rem, em, dimensions
---

## No rem, No em; Always px for Dimensions

Widget themes are embedded on customer pages where we don't control the root font-size or parent element styles. Relative units (`rem`, `em`) are unpredictable in this context.

**`rem` is forbidden** — it depends on the host page's root font-size. A `1rem` padding could be 16px on one site and 10px on another.

**`em` is forbidden** — it's relative to the parent's font-size, which cascades unpredictably when embedded.

**`px` is required** for all dimensions: heights, widths, padding, margins, gaps, borders, shadows, font-sizes, letter-spacing, line-heights.

**Unitless is fine** for inherently unitless values: opacity, font-weight, z-index, scale factors.

**`%` is fine** for structural values: `100%`, `50%` (border-radius circles), `color-mix()`.

### How variables become px in CSS

Variables store unitless numbers (e.g., `default: '13'`). The CSS converts them to px using `calc(var(...) * 1px)`:

```typescript
{
  key: 'autocomplete-header-font-size',
  type: 'number',
  default: '13',
  constraints: { min: 8, max: 32, step: 1, unit: 'px' },
}
```

```css
.ais-AutocompleteIndexHeader {
  font-size: calc(var(--ais-autocomplete-header-font-size) * 1px);
}
```

This `* 1px` conversion is the only allowed `calc()` with a hardcoded number (see `val-no-calc-magic`).

**Incorrect (em-based variable):**

```typescript
{
  key: 'autocomplete-header-font-size',
  type: 'number',
  default: '0.8',
  constraints: { min: 0.5, max: 2, step: 0.1, unit: 'em' },
}
```

**Hardcoded `1em` for line-height is acceptable** as a structural reset (meaning "match the font-size"). This is a CSS idiom, not a dimension — it's on the safe hardcoded allowlist (see `val-safe-hardcoded`).
