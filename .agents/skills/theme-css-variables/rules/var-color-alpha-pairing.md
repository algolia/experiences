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
  border-color: rgba(var(--ais-autocomplete-panel-border-color), 0.2);
}
```

**Correct (alpha controlled by its own variable):**

```css
.ais-AutocompletePanel {
  border-color: rgba(
    var(--ais-autocomplete-panel-border-color),
    var(--ais-autocomplete-panel-border-color-alpha)
  );
}
```

**In `variables.ts`, the pair looks like:**

```typescript
{
  key: 'autocomplete-panel-border-color',
  label: 'Panel border color',
  type: 'color',
  group: 'panel',
  default: { light: '150, 150, 150', dark: '100, 100, 100' },
  description: 'Color of the results panel border.',
},
{
  key: 'autocomplete-panel-border-color-alpha',
  label: 'Panel border color alpha',
  type: 'number',
  group: 'panel',
  default: '0.2',
  description: 'Opacity of the results panel border.',
  constraints: { min: 0, max: 1 },
},
```

Each color variable has its own alpha companion in the same area. Never share a color or alpha across areas — if two areas happen to use the same color, they should each have their own variable so customers can change them independently.

Always use `rgba()` with an alpha companion, even when the default opacity is `1`. This ensures the customer can always reduce opacity on any element. Never use `rgb()` — it removes the customer's ability to adjust transparency.
