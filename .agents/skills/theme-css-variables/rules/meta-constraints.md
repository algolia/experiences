---
title: Number Types Must Have min/max; px Values Need unit
impact: MEDIUM
tags: metadata, constraints, validation, types
---

## Number Types Must Have min/max; px Values Need unit

Every `type: 'number'` variable in `variables.ts` must have `constraints` with at least `min` and `max`. This powers toolbar sliders and prevents customers from entering invalid values.

### Constraint patterns by value type

| Value type | Required constraints | Example |
|------------|---------------------|---------|
| Pixel dimension | `min`, `max`, `step: 1`, `unit: 'px'` | `{ min: 0, max: 32, step: 1, unit: 'px' }` |
| Opacity / alpha | `min: 0`, `max: 1` | `{ min: 0, max: 1 }` |
| Font weight | `min: 100`, `max: 900`, `step: 100` | `{ min: 100, max: 900, step: 100 }` |
| Z-index | `min: 1`, `max: 2147483647`, `step: 1` | `{ min: 1, max: 2147483647, step: 1 }` |
| Percentage | `min`, `max`, `step`, `unit: '%'` | `{ min: 0, max: 100, step: 5, unit: '%' }` |
| Duration | `min`, `max`, `step`, `unit: 's'` | `{ min: 0, max: 2, step: 0.1, unit: 's' }` |

All dimensions (font-size, line-height, letter-spacing, etc.) are px-based — see `val-px-only`. There is no "em" or "unitless ratio" constraint pattern for dimensions.

### Rules

1. `step` is required for all pixel values (always `1`) and font weights (always `100`)
2. `unit` is required whenever the value has a unit — it's displayed in the toolbar
3. Opacity and alpha constraints don't need `step` or `unit` (implicit 0-1 range)
4. `min` and `max` should reflect practical bounds, not arbitrary limits — e.g., a border-radius max of `32` not `9999`

**Incorrect (missing constraints):**

```typescript
{
  key: 'autocomplete-panel-padding',
  type: 'number',
  default: '8',
  // No constraints — toolbar can't render a slider
}
```

**Correct:**

```typescript
{
  key: 'autocomplete-panel-padding',
  type: 'number',
  default: '8',
  constraints: { min: 0, max: 24, step: 1, unit: 'px' },
}
```
