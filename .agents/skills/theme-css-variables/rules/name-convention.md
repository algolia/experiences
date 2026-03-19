---
title: Variable Naming Convention
impact: HIGH
tags: naming, convention, format
---

## Variable Naming Convention

All CSS variables follow the format `--ais-{widget}-{area}-{property}`.

### Structure

```
--ais-{widget}-{area}-{property}
  ^      ^       ^        ^
  |      |       |        └── CSS property or concept (border-radius, padding, color)
  |      |       └── functional area (form, panel, item, header, etc.)
  |      └── widget name (autocomplete, hits, etc.)
  └── fixed prefix (Algolia InstantSearch), always present
```

The `ais` prefix is a fixed namespace — every variable in every widget starts with `--ais-`. It is not part of the widget name.

### Brand-level variables omit the area

When a variable applies to the entire widget (Tier 1 reuse), the area segment is dropped:

```
--ais-autocomplete-primary-color        (brand-level, no area)
--ais-autocomplete-text-color           (brand-level, no area)
--ais-autocomplete-transition-duration  (brand-level, no area)
```

### Scoped variables include the area

When a variable is specific to one functional zone:

```
--ais-autocomplete-form-border-radius     (area: form)
--ais-autocomplete-panel-max-height       (area: panel)
--ais-autocomplete-item-gap               (area: item)
--ais-autocomplete-header-font-weight     (area: header)
--ais-autocomplete-no-results-padding-y   (area: no-results)
--ais-autocomplete-detached-modal-top     (area: detached)
```

### Rules

1. Use full words, no abbreviations (`background-color`, not `bg-color`)
2. Use kebab-case throughout
3. The property segment should mirror CSS property names when possible (`border-radius`, `font-size`, `padding`)
4. Compound areas use hyphens (`no-results`, not `noResults`)
5. Nested areas read left to right from broad to specific (`detached-modal-border-radius`, `no-results-clear-border-color`)
