---
title: When to Use Light/Dark Defaults vs Plain String
impact: MEDIUM
tags: metadata, defaults, light-mode, dark-mode, colors
---

## When to Use Light/Dark Defaults vs Plain String

Color variables can have a single default (same for both modes) or per-mode defaults. The choice depends on whether the color needs to change between light and dark mode.

### Use `{ light, dark }` when the color inverts or shifts between modes

Colors that represent content against the background typically need mode-specific values:

```typescript
{
  key: 'autocomplete-text-color',
  type: 'color',
  default: { light: '38, 38, 38', dark: '255, 255, 255' },
}
```

```typescript
{
  key: 'autocomplete-primary-color',
  type: 'color',
  default: { light: '30, 89, 255', dark: '110, 160, 255' },
}
```

### Use a plain string when the color is mode-agnostic

Colors that look the same in both modes — typically muted/neutral tones or overlay colors:

```typescript
{
  key: 'autocomplete-overlay-color',
  type: 'color',
  default: '115, 114, 129',
}
```

```typescript
{
  key: 'autocomplete-placeholder-color',
  type: 'color',
  default: '82, 82, 82',
}
```

### Common patterns

| Pattern | Default type | Examples |
|---------|-------------|----------|
| Text on background | `{ light, dark }` | text-color, primary-color, background-color, header-color |
| Neutral / muted | plain string | placeholder-color, clear-button-color, overlay-color |
| Border colors | `{ light, dark }` | border-color (darker borders in light, lighter in dark) |
| Non-color values | plain string | All numbers, text, shadows (unless shadow differs by mode) |
| Shadows | plain string or `{ light, dark }` | Use `{ light, dark }` if shadow intensity should change between modes |

### Rules

1. When in doubt, use `{ light, dark }` — it's safer to provide mode-specific defaults
2. If a color is a gray used for secondary UI, it may not need mode variants
3. Shadows can use `{ light, dark }` if they should be more prominent in dark mode
4. Non-color types (number, text) almost never need `{ light, dark }` — spacing and sizing don't change between modes
