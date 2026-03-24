---
title: When to Use Single, x/y, Left/Right, or Per-Side Padding
impact: HIGH
tags: naming, padding, margin, spacing, granularity
---

## When to Use Single, x/y, Left/Right, or Per-Side Padding

Four levels of spacing granularity, from simplest to most granular. Always start with the simplest level that fits.

### Level 1: Single variable (uniform spacing)

Use when all sides are the same and there's no reason to vary them.

```typescript
{ key: 'autocomplete-panel-padding', default: '8' }
```

```css
padding: var(--ais-autocomplete-panel-padding);
```

### Level 2: x/y split (horizontal differs from vertical)

Use when horizontal and vertical padding are clearly different values.

```typescript
{ key: 'autocomplete-no-results-padding-y', default: '48' }
{ key: 'autocomplete-no-results-padding-x', default: '24' }
```

```css
padding: var(--ais-autocomplete-no-results-padding-y)
  var(--ais-autocomplete-no-results-padding-x);
```

### Level 3: Left/right split (each side used independently)

Use when left and right have different values AND individual sides are referenced in other CSS rules.

```typescript
{ key: 'autocomplete-form-padding-left', default: '16' }
{ key: 'autocomplete-form-padding-right', default: '12' }
```

```css
/* Used in submit button, loading indicator */
padding-left: var(--ais-autocomplete-form-padding-left);
padding-right: var(--ais-autocomplete-form-padding-right);
```

### Level 4: Per-side (all four sides independently)

Use only when each side is independently meaningful to the customer. Rare.

```typescript
{ key: 'autocomplete-header-margin-top', default: '8' }
{ key: 'autocomplete-header-margin-right', default: '4' }
{ key: 'autocomplete-header-margin-bottom', default: '4' }
{ key: 'autocomplete-header-margin-left', default: '4' }
```

```css
margin: var(--ais-autocomplete-header-margin-top)
  var(--ais-autocomplete-header-margin-right)
  var(--ais-autocomplete-header-margin-bottom)
  var(--ais-autocomplete-header-margin-left);
```

### Rules

1. **Default to single** unless there's a concrete reason to split
2. **Split x/y** when the design clearly has different horizontal and vertical spacing
3. **Split left/right** when values differ AND are referenced individually in other rules
4. **Go per-side** only when the customer genuinely needs to control each side
5. **Never use per-side when x/y would suffice** — if top = bottom and left = right, use x/y
6. For margins where only one side is non-zero, use a single directional variable (e.g., `panel-margin-top`) — don't create variables for the zero sides
