---
name: theme-css-variables
description: Guidelines for authoring and reviewing CSS custom properties (theme variables) in Experiences widget themes. Use when adding, modifying, or reviewing CSS variables in packages/theme, or when creating a new widget theme. Triggers on tasks involving widget CSS, theme variables, or ThemeVariable definitions.
license: MIT
metadata:
  author: algolia
  version: "1.0.0"
---

# Theme CSS Variables

Guidelines for authoring CSS custom properties in Experiences widget themes. Contains 14 rules across 4 categories that ensure variables are consistent, predictable, and customer-friendly.

## When to Apply

Reference these guidelines when:
- Adding new CSS variables to a widget theme
- Creating a new widget theme from scratch
- Reviewing a PR that touches `packages/theme`
- Modifying CSS files in `packages/theme/src/widgets/*/css/`
- Adding or editing `ThemeVariable` definitions in `variables.ts`

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | What to Variabilize | CRITICAL | `var-` |
| 2 | Values & Units | CRITICAL | `val-` |
| 3 | Naming & Structure | HIGH | `name-` |
| 4 | Metadata & Defaults | MEDIUM | `meta-` |

## Quick Reference

### 1. What to Variabilize (CRITICAL)

- `var-configurable-vs-structural` - Only variabilize design intent, never layout mechanics
- `var-reuse-tiers` - Default to no reuse; share only with good reason
- `var-color-alpha-pairing` - Every rgba() color needs a separate opacity companion
- `var-hover-states` - Use same color variable with different opacity for state changes

### 2. Values & Units (CRITICAL)

- `val-no-magic-numbers` - No hardcoded numeric values except safe structural ones
- `val-no-calc-magic` - Never multiply or divide a variable by a hardcoded number
- `val-px-only` - No rem, no em; always px for dimensions
- `val-safe-hardcoded` - Whitelist of values that should stay hardcoded

### 3. Naming & Structure (HIGH)

- `name-convention` - `{widget}-{area}-{property}` naming format
- `name-alpha-vs-opacity` - `-alpha` for color channels, `-opacity` for visual effects
- `name-padding-granularity` - When to use single, x/y, left/right, or per-side

### 4. Metadata & Defaults (MEDIUM)

- `meta-constraints` - Number types must have min/max; px values need unit
- `meta-descriptions` - Must describe what the variable controls, not restate the label
- `meta-light-dark` - When to use { light, dark } vs a plain string default

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/var-configurable-vs-structural.md
rules/val-no-magic-numbers.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`
