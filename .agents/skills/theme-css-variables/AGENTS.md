# Theme CSS Variables

**Version 1.0.0**
Algolia Experiences

> **Note:**
> This document is mainly for agents and LLMs to follow when authoring,
> reviewing, or refactoring CSS custom properties in Experiences widget themes.

---

## Abstract

Guidelines for authoring CSS custom properties (`--ais-*` variables) in Experiences widget themes. Contains 14 rules across 4 categories that ensure variables are consistent, predictable, and customer-friendly. Each widget theme consists of CSS files (the styles) and a `variables.ts` file (the `ThemeVariable[]` definitions that power the toolbar UI and CSS generation).

---

## Table of Contents

1. [What to Variabilize](#1-what-to-variabilize) — **CRITICAL**
   - 1.1 [Configurable vs. Structural](#11-configurable-vs-structural)
   - 1.2 [Reuse](#12-reuse)
   - 1.3 [Color-Alpha Pairing](#13-color-alpha-pairing)
   - 1.4 [Hover State Changes](#14-hover-state-changes)
2. [Values & Units](#2-values--units) — **CRITICAL**
   - 2.1 [No Magic Numbers](#21-no-magic-numbers)
   - 2.2 [No calc() with Magic Multipliers](#22-no-calc-with-magic-multipliers)
   - 2.3 [px Only for Dimensions](#23-px-only-for-dimensions)
   - 2.4 [Safe Hardcoded Values](#24-safe-hardcoded-values)
3. [Naming & Structure](#3-naming--structure) — **HIGH**
   - 3.1 [Naming Convention](#31-naming-convention)
   - 3.2 [Alpha vs. Opacity Suffix](#32-alpha-vs-opacity-suffix)
   - 3.3 [Padding Granularity](#33-padding-granularity)
4. [Metadata & Defaults](#4-metadata--defaults) — **MEDIUM**
   - 4.1 [Constraints Completeness](#41-constraints-completeness)
   - 4.2 [Description Quality](#42-description-quality)
   - 4.3 [Light/Dark Defaults](#43-lightdark-defaults)

---

## 1. What to Variabilize

### 1.1 Configurable vs. Structural

A CSS property becomes a variable when a customer might want to customize it as part of their brand or design. If changing the value would break the widget's layout or functionality, it stays hardcoded.

**Always a variable** (decorative / design intent):
- Colors, opacities, alphas
- Border widths, radii, opacities
- Spacing (padding, margins, gaps)
- Sizing (heights, widths of interactive elements)
- Typography (font-size, font-weight, line-height, letter-spacing, text-transform)
- Shadows
- Transition duration and timing function
- Z-index
- Configurable grid layouts (e.g., column sizes)

**Never a variable** (structural / layout mechanics):
- `display` (`flex`, `grid`, `none`, `block`)
- `flex-direction`, `flex-shrink`, `flex-grow`, `flex`
- `justify-content`, `align-items`
- `grid-auto-flow`
- `position` (`relative`, `absolute`, `fixed`, `static`)
- `overflow` (`hidden`, `auto`)
- `appearance` (`none`)
- `cursor` (`pointer`, `initial`)
- `text-align` (`left`, `center`)
- `text-overflow`, `white-space`
- `list-style`
- `pointer-events`
- `transform-origin`
- `font-family` (always `inherit`)
- `order` (DOM arrangement)
- `box-sizing`
- Resets (`border: 0`, `margin: 0`, `padding: 0`)

```css
/* WRONG: structural properties as variables */
.ais-AutocompleteForm {
  display: var(--ais-autocomplete-form-display);
  position: var(--ais-autocomplete-form-position);
}

/* RIGHT: structural hardcoded, design intent variabilized */
.ais-AutocompleteForm {
  display: flex;
  position: relative;
  border-radius: var(--ais-autocomplete-form-border-radius);
  background-color: rgba(
    var(--ais-autocomplete-background-color),
    var(--ais-autocomplete-background-color-alpha)
  );
}
```

**The test:** "Would a customer embedding this widget ever need to change this value to match their brand?" If yes, it's a variable. If no, it's structural.

---

### 1.2 Reuse

Variable reuse creates coupling. The default is to **not reuse** — every CSS declaration gets its own variable unless there's a specific reason to share. Even within the same functional area, don't share a variable between two declarations just because they happen to have the same value today.

```css
/* WRONG: sharing within an area without reason */
.ais-AutocompleteIndexItem {
  padding: var(--ais-autocomplete-item-padding);
}
.ais-AutocompleteItemActionButton svg {
  margin: var(--ais-autocomplete-item-padding); /* not the same design decision */
}

/* RIGHT: dedicated variable for each purpose */
.ais-AutocompleteIndexItem {
  padding: var(--ais-autocomplete-item-padding);
}
.ais-AutocompleteItemActionButton svg {
  margin: var(--ais-autocomplete-item-action-icon-margin);
}
```

**Valid reasons to reuse:**

1. **Brand consistency** — A single color, transition, or icon size should feel uniform across the widget (brand-level variables).
2. **Spatial alignment** — Two elements must stay aligned with each other. E.g., `form-padding-left` is reused by the submit button and loading indicator because they must align with the form's left edge.
3. **Visual rhythm** — Elements within a group should have uniform spacing to form a visual pattern. E.g., a gap variable shared between items in a list.
4. **Same UI concept** — The variable describes a single concept that manifests in multiple places. E.g., `icon-size` applies to all SVGs because "how big are icons" is one decision.

**Not a valid reason to reuse:**

- **Same value today** — Two things being `4px` doesn't mean they should change together.
- **Same CSS property** — Two elements both having `padding` doesn't mean they share a design decision.
- **Same area** — Being in the same functional zone doesn't justify sharing. Item padding and item icon border-radius are unrelated decisions.
- **Convenience** — Fewer variables is not a goal. Clarity is.

When reuse is justified, it falls into two tiers:

**Tier 1 — Brand-level (shared across all areas):**
Global design decisions. The exhaustive list:

- `primary-color` + `primary-color-alpha`
- `text-color` + `text-color-alpha`
- `background-color` + `background-color-alpha`
- `border-color`
- `muted-color-alpha`
- `icon-size`, `icon-stroke-width`
- `transition-duration`, `transition-timing-function`
- `base-unit`

**Tier 2 — Scoped (within one functional area):**
Prefixed by their area, only referenced within that area's CSS. Reuse within a scoped variable must still pass the "valid reasons" test above.

- `form-*`, `panel-*`, `item-*`, `header-*`, `no-results-*`, `detached-*`, `scrollbar-*`

**The test:** before reusing a variable, ask "if a customer changes this value, should both elements update?" If the answer isn't a clear yes, create a new variable. Coupling through reuse is harder to undo than duplication.

---

### 1.3 Color-Alpha Pairing

Colors are stored as RGB triplets (e.g., `"30, 89, 255"`) and composed with `rgba()` in CSS. The alpha channel is always a separate variable.

```css
/* WRONG: hardcoded alpha */
border-color: rgba(var(--ais-autocomplete-border-color), 0.2);

/* RIGHT: alpha controlled by its own variable */
border-color: rgba(
  var(--ais-autocomplete-border-color),
  var(--ais-autocomplete-panel-border-opacity)
);
```

The color variable is brand-level (Tier 1), while the opacity variable is scoped to the area (Tier 2). This lets the customer set one border color for the whole widget but control border prominence per area.

Always use `rgba()` with an opacity companion, even when the default opacity is `1`. This ensures the customer can always reduce opacity on any element. Never use `rgb()` — it removes the customer's ability to adjust transparency.

---

### 1.4 Hover State Changes

Hover, focus, and active states should modify opacity, not introduce new color variables.

```css
/* WRONG: new color variable for hover */
.element:hover {
  border-color: var(--ais-autocomplete-element-hover-border-color);
}

/* RIGHT: same color, different opacity */
.element {
  border-color: rgba(
    var(--ais-autocomplete-border-color),
    var(--ais-autocomplete-element-border-opacity)
  );
}
.element:hover {
  border-color: rgba(
    var(--ais-autocomplete-border-color),
    var(--ais-autocomplete-element-hover-border-opacity)
  );
}
```

**Exception:** switching to an existing brand-level variable on hover is fine (e.g., muted icon becomes text-color on hover). Never create a new color variable solely for a hover state.

---

## 2. Values & Units

### 2.1 No Magic Numbers

Every numeric value that a customer might want to tweak must be a variable. Hardcoded numbers are only acceptable when structural — see §2.4 Safe Hardcoded Values for the exhaustive allowlist.

```css
/* WRONG: magic numbers */
transform: scale(0.95) translateY(-8px);
line-height: 1.25em;

/* RIGHT: variabilized */
transform: scale(var(--ais-autocomplete-panel-open-scale))
  translateY(var(--ais-autocomplete-panel-open-offset));
line-height: var(--ais-autocomplete-detached-search-query-line-height);
```

**The test:** if the number isn't in the §2.4 allowlist, it needs a variable.

---

### 2.2 No calc() with Magic Multipliers

`calc()` expressions that multiply or divide a variable by a hardcoded number create hidden relationships the customer can't control.

```css
/* WRONG: hidden halving relationship */
padding: 0 calc(var(--ais-autocomplete-form-padding-right) / 2);

/* RIGHT: dedicated variable */
padding: 0 var(--ais-autocomplete-detached-clear-button-padding);
```

**The only allowed `calc()` pattern** is `* 1px` for unit conversion — variables store unitless numbers and CSS needs units. This is a CSS mechanics pattern, not a design relationship:

```css
/* OK: converting unitless variable (16) to 16px */
font-size: calc(var(--ais-autocomplete-base-unit) * 1px);
```

Any other arithmetic in `calc()` — dividing, multiplying by a number other than `1px`, subtracting — means you should create a dedicated variable instead.

---

### 2.3 px Only for Dimensions

Widget themes are embedded on customer pages where we don't control the root font-size or parent element styles.

- **`rem` is forbidden** — depends on host page root font-size
- **`em` is forbidden** — relative to parent, unpredictable when embedded
- **`px` is required** for all dimensions: heights, widths, padding, margins, gaps, borders, shadows, font-sizes, letter-spacing, line-heights
- **Unitless is fine** for inherently unitless values: opacity, font-weight, z-index, scale
- **`%` is fine** for structural values: `100%`, `50%`, `color-mix()`
- **Hardcoded `1em` for line-height is acceptable** as a structural reset ("match the font-size") — it's on the safe hardcoded allowlist (§2.4)

Variables store unitless numbers. CSS converts them to px with `calc(var(...) * 1px)` — the only allowed `calc()` with a hardcoded number (§2.2).

```typescript
/* WRONG: em-based variable */
{ key: 'autocomplete-header-font-size', default: '0.8', constraints: { unit: 'em' } }

/* RIGHT: px-based variable */
{ key: 'autocomplete-header-font-size', default: '13', constraints: { unit: 'px' } }
```

---

### 2.4 Safe Hardcoded Values

Some CSS values are structural and must not become variables.

**Structural zeros and fills:** `0`, `100%`, `100vh`, `50%`, `1fr`

**Structural numbers:** `0`/`1` for flex-shrink/grow/opacity, `1em` for line-height

**CSS keywords:** `none`, `auto`, `inherit`, `initial`, `normal`, `thin`, `medium`, `solid`, `content-box`

**Layout values:** `flex`, `grid`, `block`, `none`, `column`, `row`, `center`, `space-between`, `hidden`, `auto`, `pointer`, `relative`, `absolute`, `fixed`, `static`, `left`, `right`, `ellipsis`, `nowrap`

**Appearance resets:** `appearance: none`

**Font inheritance:** `font-family: inherit`, `font: inherit`

**Empty state patterns:** `:empty { display: none }`, `[hidden] { display: none }`

**Explicit resets:** Always write `margin: 0`, `padding: 0`, `border: 0` explicitly. Use `border: 0` (not `border: none`) for consistency.

---

## 3. Naming & Structure

### 3.1 Naming Convention

All CSS variables follow the format `--ais-{widget}-{area}-{property}`.

```
--ais-{widget}-{area}-{property}
  ^      ^       ^        ^
  |      |       |        └── CSS property or concept
  |      |       └── functional area (form, panel, item, header, etc.)
  |      └── widget name (autocomplete, hits, etc.)
  └── fixed prefix (Algolia InstantSearch), always present
```

The `ais` prefix is a fixed namespace — every variable in every widget starts with `--ais-`. It is not part of the widget name.

**Brand-level variables omit the area:**

```
--ais-autocomplete-primary-color
--ais-autocomplete-text-color
--ais-autocomplete-transition-duration
```

**Scoped variables include the area:**

```
--ais-autocomplete-form-border-radius
--ais-autocomplete-panel-max-height
--ais-autocomplete-item-gap
--ais-autocomplete-no-results-padding-y
--ais-autocomplete-detached-modal-top
```

**Rules:**
1. Full words, no abbreviations (`background-color`, not `bg-color`)
2. kebab-case throughout
3. Property segment should mirror CSS property names (`border-radius`, `font-size`)
4. Compound areas use hyphens (`no-results`, not `noResults`)
5. Nested areas read left to right, broad to specific (`detached-modal-border-radius`, `no-results-clear-border-color`)

---

### 3.2 Alpha vs. Opacity Suffix

Both represent 0-1 values but serve different roles.

**`-alpha`:** the alpha channel of a color variable. Always paired with a `-color` variable. Brand-level.

```
autocomplete-primary-color       → autocomplete-primary-color-alpha
autocomplete-text-color          → autocomplete-text-color-alpha
autocomplete-background-color    → autocomplete-background-color-alpha
```

```css
color: rgba(var(--ais-autocomplete-text-color), var(--ais-autocomplete-text-color-alpha));
```

**`-opacity`:** a visual effect on a specific element. Scoped to an area.

```
autocomplete-form-border-opacity
autocomplete-panel-border-opacity
autocomplete-item-selected-opacity
autocomplete-no-results-icon-opacity
```

```css
border-color: rgba(var(--ais-autocomplete-border-color), var(--ais-autocomplete-panel-border-opacity));
```

**The shared alpha exception:** `muted-color-alpha` is a brand-level opacity for secondary elements. It doesn't have its own color — it's composed with different color variables:

```css
color: rgba(var(--ais-autocomplete-placeholder-color), var(--ais-autocomplete-muted-color-alpha));
color: rgba(var(--ais-autocomplete-item-icon-color), var(--ais-autocomplete-muted-color-alpha));
```

---

### 3.3 Padding Granularity

Four levels, from simplest to most granular. Always start with the simplest that fits.

| Level | When | Example |
|-------|------|---------|
| **Single** | All sides are the same | `panel-padding` → `padding: var()` |
| **x/y** | Horizontal differs from vertical | `no-results-padding-y` + `no-results-padding-x` |
| **Left/right** | Values differ AND sides are referenced individually elsewhere | `form-padding-left` + `form-padding-right` |
| **Per-side** | Each side is independently meaningful to the customer | `header-margin-top/right/bottom/left` |

**Rules:**
1. Default to single
2. Split x/y when horizontal and vertical spacing clearly differ
3. Split left/right when values differ AND individual sides are referenced in other rules
4. Go per-side only when the customer genuinely needs independent control
5. Never use per-side when x/y would suffice
6. For margins where only one side is non-zero, use a single directional variable — don't create variables for the zero sides

---

## 4. Metadata & Defaults

### 4.1 Constraints Completeness

Every `type: 'number'` variable must have `constraints` with `min` and `max`.

| Value type | Required constraints |
|------------|---------------------|
| Pixel dimension | `min`, `max`, `step: 1`, `unit: 'px'` |
| Opacity / alpha | `min: 0`, `max: 1` |
| Font weight | `min: 100`, `max: 900`, `step: 100` |
| Z-index | `min: 1`, `max: 2147483647`, `step: 1` |
| Percentage | `min`, `max`, `step`, `unit: '%'` |
| Duration | `min`, `max`, `step`, `unit: 's'` |

All dimensions (font-size, line-height, letter-spacing, etc.) are px-based — see §2.3. `min` and `max` should reflect practical bounds — a border-radius max of `32`, not `9999`.

---

### 4.2 Description Quality

The `description` field is shown to customers in the toolbar. It must explain what the variable affects in the UI.

```typescript
/* WRONG: restates the label */
{ label: 'Panel padding', description: 'The panel padding.' }

/* RIGHT: explains the effect */
{ label: 'Panel padding', description: 'Inner padding of the panel.' }

/* BETTER: spatial context */
{ label: 'Form padding left', description: 'Left padding inside the form, before the search icon.' }
```

**Rules:**
1. Start with what the variable controls: "Inner padding of...", "Color of...", "Opacity of..."
2. Mention the affected element
3. Add spatial context when it helps
4. One sentence
5. Don't include the unit or default value

---

### 4.3 Light/Dark Defaults

**Use `{ light, dark }` when the color inverts or shifts between modes:**

```typescript
{ key: 'autocomplete-text-color', default: { light: '38, 38, 38', dark: '255, 255, 255' } }
{ key: 'autocomplete-primary-color', default: { light: '30, 89, 255', dark: '110, 160, 255' } }
```

**Use a plain string when the color is mode-agnostic:**

```typescript
{ key: 'autocomplete-overlay-color', default: '115, 114, 129' }
{ key: 'autocomplete-placeholder-color', default: '82, 82, 82' }
```

| Pattern | Default type |
|---------|-------------|
| Text on background | `{ light, dark }` |
| Primary / brand | `{ light, dark }` |
| Background | `{ light, dark }` |
| Border | `{ light, dark }` |
| Neutral / muted | plain string |
| Non-color values | plain string |

When in doubt, use `{ light, dark }`. Non-color types (number, text) almost never need it.
