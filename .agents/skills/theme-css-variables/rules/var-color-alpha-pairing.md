---
title: Every rgba() Color Needs a Separate Opacity Companion
impact: CRITICAL
tags: colors, opacity, rgba, design-tokens
---

## Every rgba() Color Needs a Separate Opacity Companion

Colors are stored as RGB triplets (e.g., `"30, 89, 255"`) and composed with `rgba()` in CSS. The alpha channel is always a separate variable so customers can adjust color and opacity independently.

**Incorrect (hardcoded alpha inside rgba):**

```css
.ais-AutocompletePanel {
  border-color: rgba(var(--ais-autocomplete-border-color), 0.2);
}
```

**Correct (alpha controlled by its own variable):**

```css
.ais-AutocompletePanel {
  border-color: rgba(
    var(--ais-autocomplete-border-color),
    var(--ais-autocomplete-panel-border-opacity)
  );
}
```

**In `variables.ts`, the pair looks like:**

```typescript
{
  key: 'autocomplete-border-color',
  label: 'Border color',
  type: 'color',
  group: 'colors',
  default: { light: '150, 150, 150', dark: '100, 100, 100' },
  description: 'Color for borders and dividers.',
},
{
  key: 'autocomplete-panel-border-opacity',
  label: 'Panel border opacity',
  type: 'number',
  group: 'panel',
  default: '0.2',
  description: 'Opacity of the panel border.',
  constraints: { min: 0, max: 1 },
},
```

The color variable is brand-level (Tier 1 reuse), while the opacity variable is scoped to the area (Tier 2). This lets the customer set one border color for the whole widget but control how prominent borders are in each area.

Always use `rgba()` with an opacity companion, even when the default opacity is `1`. This ensures the customer can always reduce opacity on any element. Never use `rgb()` — it removes the customer's ability to adjust transparency.
