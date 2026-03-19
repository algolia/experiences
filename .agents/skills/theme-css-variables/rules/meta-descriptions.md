---
title: Descriptions Must Describe What the Variable Controls
impact: MEDIUM
tags: metadata, descriptions, labels, documentation
---

## Descriptions Must Describe What the Variable Controls

The `description` field in `ThemeVariable` is shown to customers in the toolbar. It must explain what the variable affects in the UI, not just restate the label.

**Incorrect (restates the label):**

```typescript
{
  key: 'autocomplete-panel-padding',
  label: 'Panel padding',
  description: 'The panel padding.',
}
```

**Correct (explains the effect):**

```typescript
{
  key: 'autocomplete-panel-padding',
  label: 'Panel padding',
  description: 'Inner padding of the panel.',
}
```

**Better (explains context when useful):**

```typescript
{
  key: 'autocomplete-form-padding-left',
  label: 'Form padding left',
  description: 'Left padding inside the form, before the search icon.',
}
```

```typescript
{
  key: 'autocomplete-panel-columns-breakpoint',
  label: 'Panel columns breakpoint',
  description:
    'Viewport width in pixels below which the two-column layout collapses to a single column.',
}
```

### Rules

1. Start with what the variable controls: "Inner padding of...", "Color of...", "Opacity of..."
2. Mention the affected element: "...the search form", "...section headers", "...result items"
3. Add spatial context when it helps: "before the search icon", "between icon and text"
4. Keep it to one sentence
5. Don't include the unit — that's in `constraints.unit`
6. Don't include the default value — the toolbar shows it
