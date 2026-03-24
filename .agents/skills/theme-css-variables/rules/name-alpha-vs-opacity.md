---
title: "-alpha" for Color Channels, "-opacity" for Visual Effects
impact: HIGH
tags: naming, alpha, opacity, colors
---

## "-alpha" for Color Channels, "-opacity" for Visual Effects

The suffixes `-alpha` and `-opacity` both represent 0-1 values but serve different roles. Use them consistently.

### `-alpha`: the alpha channel of a color

Used when the variable is the alpha companion of a color variable. It's always paired with a specific `-color` variable and composed inside `rgba()`. Every color variable that's used in `rgba()` must have its own `-alpha` companion — never share an alpha across multiple colors.

```
{widget}-{area}-{property}-color       → {widget}-{area}-{property}-color-alpha

# Examples:
autocomplete-primary-color             → autocomplete-primary-color-alpha
autocomplete-form-border-color         → autocomplete-form-border-color-alpha
autocomplete-item-icon-color           → autocomplete-item-icon-color-alpha
```

**Pattern:** `-alpha` always travels with its paired color. The key is `{color-key}-alpha`. If the customer changes a color, they can adjust its alpha independently.

### `-opacity`: a visual effect on a specific element

Used when the variable controls how prominent a specific element is, independent of which color it uses. The element's opacity is not tied to a single color — it may affect text, background, and borders together, or control a non-color visual property.

```
# Examples:
autocomplete-item-selected-opacity
autocomplete-no-results-icon-opacity
```

**Pattern:** `-opacity` is scoped to a specific area and element. It controls visual prominence, not a color channel.

### `-alpha` paired with its own color:

```css
border-color: rgba(
  var(--ais-autocomplete-form-border-color),
  var(--ais-autocomplete-form-border-color-alpha)
);
```

### `-opacity` on a non-color element property:

```css
.ais-AutocompleteIndexItem[aria-selected="true"] {
  background-color: rgba(
    var(--ais-autocomplete-text-color),
    var(--ais-autocomplete-item-selected-opacity)
  );
}
```
