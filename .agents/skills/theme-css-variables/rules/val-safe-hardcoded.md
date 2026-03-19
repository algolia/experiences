---
title: Whitelist of Values That Should Stay Hardcoded
impact: CRITICAL
tags: values, hardcoding, resets, structural
---

## Whitelist of Values That Should Stay Hardcoded

Some CSS values are structural and must not become variables. This is the exhaustive allowlist.

### Structural zeros and fills

| Value | Usage |
|-------|-------|
| `0` | Resets: `margin: 0`, `padding: 0`, `border: 0` |
| `100%` | Fill parent: `width: 100%`, `height: 100%` |
| `100vh` | Viewport lock: `height: 100vh` |
| `50%` | Circles: `border-radius: 50%` |
| `1fr` | Equal grid columns |

### Structural numbers

| Value | Usage |
|-------|-------|
| `0` / `1` | `flex-shrink`, `flex-grow`, `opacity` reset |
| `1em` | Line-height "match font-size" reset |

### CSS keywords

`none`, `auto`, `inherit`, `initial`, `normal`, `thin`, `medium`, `solid`, `content-box`

### Layout values

`flex`, `grid`, `block`, `none`, `column`, `row`, `center`, `space-between`, `flex-start`, `flex-end`, `nowrap`, `hidden`, `auto`, `pointer`, `initial`, `relative`, `absolute`, `fixed`, `static`, `left`, `right`, `ellipsis`

### Appearance resets

```css
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
```

### Font inheritance

```css
font-family: inherit;
font: inherit;
```

### Empty state and visibility patterns

```css
.element:empty { display: none; }
.element[hidden] { display: none; }
```

**Everything else** — any numeric value, any color, any timing — must be a variable.
