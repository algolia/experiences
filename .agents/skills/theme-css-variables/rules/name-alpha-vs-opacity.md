---
title: "-alpha" for Color Channels, "-opacity" for Visual Effects
impact: HIGH
tags: naming, alpha, opacity, colors
---

## "-alpha" for Color Channels, "-opacity" for Visual Effects

The suffixes `-alpha` and `-opacity` both represent 0-1 values but serve different roles. Use them consistently.

### `-alpha`: the alpha channel of a color

Used when the variable is the alpha companion of a color variable. It's always paired with a specific `-color` variable and composed inside `rgba()`.

```
autocomplete-primary-color         → autocomplete-primary-color-alpha
autocomplete-text-color            → autocomplete-text-color-alpha
autocomplete-background-color      → autocomplete-background-color-alpha
autocomplete-header-color          → autocomplete-header-color-alpha
```

**Pattern:** `-alpha` is always a brand-level opacity that travels with its color. If the customer changes `primary-color`, they might also adjust `primary-color-alpha`.

### `-opacity`: a visual effect on a specific element

Used when the variable controls how prominent a specific element is, independent of which color it uses.

```
autocomplete-form-border-opacity
autocomplete-panel-border-opacity
autocomplete-item-selected-opacity
autocomplete-no-results-icon-opacity
autocomplete-no-results-clear-hover-border-opacity
```

**Pattern:** `-opacity` is always scoped to a specific area and element. The border color might be shared, but the form border's prominence is its own concern.

### `-alpha` paired with a shared color (brand-level):

```css
color: rgba(
  var(--ais-autocomplete-text-color),
  var(--ais-autocomplete-text-color-alpha)
);
```

### `-opacity` paired with a shared color (scoped to area):

```css
border-color: rgba(
  var(--ais-autocomplete-border-color),
  var(--ais-autocomplete-panel-border-opacity)
);
```

### The shared `-alpha` exception: `muted-color-alpha`

`muted-color-alpha` is a brand-level opacity for secondary elements (placeholders, icons, action buttons). It doesn't have its own color — instead it's composed with different color variables to create a "muted" effect:

```css
/* Muted placeholder */
color: rgba(var(--ais-autocomplete-placeholder-color), var(--ais-autocomplete-muted-color-alpha));

/* Muted icon */
color: rgba(var(--ais-autocomplete-item-icon-color), var(--ais-autocomplete-muted-color-alpha));
```
