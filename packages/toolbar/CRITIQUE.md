# Design Critique: Algolia Experiences Toolbar

## Anti-Patterns Verdict: PASS

This does **not** read as AI-generated. No gradient text, no glassmorphism, no dark-mode-with-glowing-accents, no hero metrics dashboard layout. The palette is restrained (Algolia blue primary on white, neutral grays). No sparkle icons except for the "Generate" tab, which is contextually appropriate. The component library follows shadcn/ui conventions without the telltale AI overuse of rounded cards with identical spacing. It feels like a tool built by product engineers, not a prompt.

## Overall Impression

A solid, functional configuration sidebar that prioritizes utility over flair. It feels like a browser DevTools panel or a Figma plugin — utilitarian, dense, and mostly clear. The strongest quality is **information density without chaos**: collapsible cards, hover-revealed toolbars, and a clean tab structure keep complexity manageable.

The single biggest opportunity: **the toolbar has no visual identity beyond the Algolia logo**. It's competent but forgettable. For a tool that represents Algolia's brand to customers configuring their search experience, it could carry more personality.

## What's Working

1. **Hover-revealed action toolbars** (`block-card.tsx:142`, `index-block-group.tsx:75`). These keep the interface clean when browsing while making actions immediately available on intent. The opacity transition is smooth and the `focus-within:opacity-100` fallback ensures keyboard accessibility.

2. **The "Add Widget" dashed-border affordance** (`add-widget-popover.tsx:23`). The dashed border + muted text + rotating plus icon on hover is a well-established pattern that clearly communicates "drop zone / add action" without competing with existing content. The hover state transitioning to primary color reinforces the action.

3. **Theme editor structure** (`theme-editor.tsx`). The Preset > Mode Config > Mode > Variable Group > Variable hierarchy is well-organized. The "N changed" badge on collapsed groups (`theme-editor.tsx:329`) is a smart touch — it gives users a sense of where their customizations live without expanding every section.

## Priority Issues

### 1. No delete confirmation for destructive actions

- **What**: Clicking the trash icon instantly deletes a widget block with no undo or confirmation (`block-card.tsx:204`, `app.tsx:380`).
- **Why it matters**: Accidentally deleting a configured widget (especially one with many customized parameters) has no recovery path except re-adding and reconfiguring from scratch. This is the highest-stakes interaction in the toolbar.
- **Fix**: Add either an undo toast (preferred — lower friction) or a confirmation dialog. An undo toast with a 5-second window is the modern standard for this pattern.
- **Command**: `/harden`

### 2. The Theme tab empty state is too passive

- **What**: When no autocomplete widget exists, the Theme tab shows "Add an Autocomplete widget to start customizing the theme" with a "Go to widgets" button (`panel.tsx:428-441`).
- **Why it matters**: Users who click "Theme" have clear intent. The current empty state requires them to understand the prerequisite (autocomplete widget), navigate away, find the right widget type, add it, then come back. That's 4 steps when the system could do it in 1.
- **Fix**: Replace "Go to widgets" with "Add Autocomplete widget" that directly triggers `onAddBlock('ais.autocomplete')`. Show a brief explanation of _why_ theming requires autocomplete.
- **Command**: `/onboard`

### 3. Tab segmented controls are duplicated without reuse

- **What**: The theme editor has three separate inline implementations of the same segmented control pattern — Adaptive/Fixed (`theme-editor.tsx:127-154`), Light/Dark (`theme-editor.tsx:156-201`), and Customize/Generate (`theme-editor.tsx:217-268`). These are not using `TabsList`/`TabsTrigger` from the UI library.
- **Why it matters**: Inconsistent implementation risks visual drift (the inline versions use `text-xs` while `TabsTrigger` uses `text-sm`), and the inline versions lack the ARIA attributes (`role="tab"`, `aria-selected`) that the tab components provide.
- **Fix**: Refactor to use `TabsList`/`TabsTrigger` or extract a shared `SegmentedControl` component. This ensures consistent sizing, focus styles, and accessibility semantics.
- **Command**: `/extract`

### 4. `pb-40` as scroll-content-bottom hack

- **What**: Both the Blocks list (`panel.tsx:340`) and Customize view (`theme-editor.tsx:275`) use `pb-40` (160px of bottom padding) to ensure content isn't hidden behind... nothing visible. There's no fixed bottom bar or floating action that would justify this.
- **Why it matters**: 160px of dead space at the bottom of every scrollable area is a lot of wasted real estate in a 480px-wide panel. Users scrolling to the end will see a large empty void, which feels unfinished.
- **Fix**: If this padding exists to clear the pill button or toast, use a more precise value. If it's just a buffer, reduce to `pb-8` or `pb-12`. If there's a planned sticky footer, add it — don't pre-allocate space for it.
- **Command**: `/distill`

### 5. Toast positioning doesn't account for panel state

- **What**: The toast is `fixed bottom-4 left-1/2 -translate-x-1/2` (`app.tsx:791`), centering it in the full viewport. When the panel is open, the visible content area shifts right by 480px, but the toast still centers on the full viewport — appearing partially behind the panel.
- **Why it matters**: Error messages and save confirmations are critical feedback. If they're partially obscured by the panel, users miss them.
- **Fix**: When the panel is open, offset the toast's centering to account for panel width (e.g., `left: calc(50% + 240px)` when open).
- **Command**: `/polish`

## Minor Observations

- **Inline SVG icons everywhere**: The Algolia logo SVG is duplicated in `panel.tsx:205-213` and `pill.tsx:27-34`. Every icon is an inline `<svg>` element. The MEMORY.md already notes the TODO to switch to Lucide — this would also reduce bundle size and improve maintainability.

- **The Pill's lock badge is tiny**: The lock icon (`pill.tsx:42-57`) is `size-5` (20px) with a `size-2.5` (10px) icon inside. On a real page, this is nearly invisible — especially as the visual cue that distinguishes "click to open" from "click to authenticate." Consider making the locked state more visually distinct (e.g., dimming the pill itself, or using a different pill color).

- **No keyboard shortcut to open/close the panel**: Power users configuring widgets repeatedly would benefit from a keyboard shortcut (e.g., `Cmd+.` or `Escape` to close). The panel already has `inert` handling but no key listener.

- **`z-index: 2147483647`** appears on the panel, pill, and toast. Max int z-index is a reasonable defensive choice for an injected toolbar, but it means all three compete at the same layer. If the toast and panel overlap, stacking order falls back to DOM order.

## Questions to Consider

- **What if the panel slid in from the right instead of left?** Left-side panels compete with site navigation on most pages. Right-side would avoid this and feel more like a secondary tool.
- **Does "Save" need to be in the header?** It's the most important action but shares space with the logo and close button. A sticky bottom bar with Save + a dirty-state indicator might create clearer hierarchy.
- **What would this look like with section headers that carried more weight?** The "Index" label (`index-block-group.tsx:66-67`) at `text-xs uppercase tracking-wide` is very light. Slightly bolder section breaks would make scanning the block list faster.
- **Should the element picker be more prominent?** The crosshair icon only appears on hover inside a collapsed toolbar. For a tool whose core job is mapping widgets to DOM elements, this action might deserve more visual weight.
