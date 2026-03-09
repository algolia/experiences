export type ThemeVariableType = 'color' | 'size' | 'text';

export type SliderConfig = {
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type ThemeVariable = {
  key: string;
  label: string;
  type: ThemeVariableType;
  default: string;
  section: 'global' | 'autocomplete';
  category: string;
  slider?: SliderConfig;
};

export const THEME_VARIABLES: ThemeVariable[] = [
  // ── Global variables ──────────────────────────────────────────────────

  // Colors
  {
    key: 'primary-color-rgb',
    label: 'Primary color',
    type: 'color',
    default: '30, 89, 255',
    section: 'global',
    category: 'Colors',
  },
  {
    key: 'text-color-rgb',
    label: 'Text color',
    type: 'color',
    default: '38, 38, 38',
    section: 'global',
    category: 'Colors',
  },
  {
    key: 'muted-color-rgb',
    label: 'Muted/secondary text color',
    type: 'color',
    default: '82, 82, 82',
    section: 'global',
    category: 'Colors',
  },
  {
    key: 'button-text-color-rgb',
    label: 'Button text color',
    type: 'color',
    default: '255, 255, 255',
    section: 'global',
    category: 'Colors',
  },
  {
    key: 'border-color-rgb',
    label: 'Border color',
    type: 'color',
    default: '150, 150, 150',
    section: 'global',
    category: 'Colors',
  },
  {
    key: 'background-color-rgb',
    label: 'Background color',
    type: 'color',
    default: '255, 255, 255',
    section: 'global',
    category: 'Colors',
  },

  // Border radius
  {
    key: 'border-radius-sm',
    label: 'Small radius',
    type: 'size',
    default: '4px',
    section: 'global',
    category: 'Border radius',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'border-radius-md',
    label: 'Medium radius',
    type: 'size',
    default: '8px',
    section: 'global',
    category: 'Border radius',
    slider: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'border-radius-lg',
    label: 'Large radius',
    type: 'size',
    default: '16px',
    section: 'global',
    category: 'Border radius',
    slider: { min: 0, max: 48, step: 1, unit: 'px' },
  },

  // Typography
  {
    key: 'font-weight-semibold',
    label: 'Semibold weight',
    type: 'text',
    default: '600',
    section: 'global',
    category: 'Typography',
    slider: { min: 100, max: 900, step: 100, unit: '' },
  },
  {
    key: 'font-weight-bold',
    label: 'Bold weight',
    type: 'text',
    default: '700',
    section: 'global',
    category: 'Typography',
    slider: { min: 100, max: 900, step: 100, unit: '' },
  },

  // Icons
  {
    key: 'icon-size',
    label: 'Icon size',
    type: 'size',
    default: '20px',
    section: 'global',
    category: 'Icons',
    slider: { min: 12, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'icon-stroke-width',
    label: 'Icon stroke width',
    type: 'text',
    default: '1.6',
    section: 'global',
    category: 'Icons',
    slider: { min: 0.5, max: 4, step: 0.5, unit: '' },
  },

  // Spacing
  {
    key: 'base-unit',
    label: 'Base unit',
    type: 'text',
    default: '16',
    section: 'global',
    category: 'Spacing',
    slider: { min: 8, max: 24, step: 1, unit: '' },
  },

  // Transitions
  {
    key: 'transition-duration',
    label: 'Transition duration',
    type: 'text',
    default: '0.3s',
    section: 'global',
    category: 'Transitions',
  },

  // Shadows
  {
    key: 'shadow-lg',
    label: 'Large shadow',
    type: 'text',
    default:
      '0 0 0 1px rgba(23, 23, 23, 0.05), 0 4px 8px -4px rgba(23, 23, 23, 0.15), 0 16px 24px -8px rgba(23, 23, 23, 0.15)',
    section: 'global',
    category: 'Shadows',
  },

  // ── Autocomplete-scoped variables ─────────────────────────────────────
  // Each defaults to a global variable via the override CSS, so changing
  // globals still cascades. Overriding here only affects the autocomplete.

  // Input
  {
    key: 'autocomplete-input-border-radius',
    label: 'Input border radius',
    type: 'size',
    default: '4px',
    section: 'autocomplete',
    category: 'Input',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-input-focus-color-rgb',
    label: 'Input focus color',
    type: 'color',
    default: '30, 89, 255',
    section: 'autocomplete',
    category: 'Input',
  },
  {
    key: 'autocomplete-search-icon-color-rgb',
    label: 'Search icon color',
    type: 'color',
    default: '30, 89, 255',
    section: 'autocomplete',
    category: 'Input',
  },
  {
    key: 'autocomplete-search-icon-size',
    label: 'Search icon size',
    type: 'size',
    default: '20px',
    section: 'autocomplete',
    category: 'Input',
    slider: { min: 12, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-search-icon-padding-left',
    label: 'Search icon padding left',
    type: 'size',
    default: '14px',
    section: 'autocomplete',
    category: 'Input',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-search-icon-padding-right',
    label: 'Search icon padding right',
    type: 'size',
    default: '11px',
    section: 'autocomplete',
    category: 'Input',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-search-input-height',
    label: 'Input height',
    type: 'size',
    default: '44px',
    section: 'autocomplete',
    category: 'Input',
    slider: { min: 32, max: 72, step: 2, unit: 'px' },
  },

  // Dropdown
  {
    key: 'autocomplete-panel-border-radius',
    label: 'Panel border radius',
    type: 'size',
    default: '4px',
    section: 'autocomplete',
    category: 'Dropdown',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-gap',
    label: 'Gap between input and panel',
    type: 'size',
    default: '8px',
    section: 'autocomplete',
    category: 'Dropdown',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-padding',
    label: 'Panel inner padding',
    type: 'size',
    default: '8px',
    section: 'autocomplete',
    category: 'Dropdown',
    slider: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-max-height',
    label: 'Panel max height',
    type: 'size',
    default: '650px',
    section: 'autocomplete',
    category: 'Dropdown',
    slider: { min: 200, max: 800, step: 20, unit: 'px' },
  },

  // Results
  {
    key: 'autocomplete-item-border-radius',
    label: 'Item border radius',
    type: 'size',
    default: '4px',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-selected-color-rgb',
    label: 'Item hover/selected color',
    type: 'color',
    default: '30, 89, 255',
    section: 'autocomplete',
    category: 'Results',
  },
  {
    key: 'autocomplete-item-padding',
    label: 'Item padding',
    type: 'size',
    default: '4px',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-gap',
    label: 'Item content gap',
    type: 'size',
    default: '8px',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-icon-border-radius',
    label: 'Item icon border radius',
    type: 'size',
    default: '4px',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-icon-size',
    label: 'Result icon size',
    type: 'size',
    default: '20px',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 12, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-highlight-weight',
    label: 'Highlight weight',
    type: 'text',
    default: '700',
    section: 'autocomplete',
    category: 'Results',
    slider: { min: 100, max: 900, step: 100, unit: '' },
  },

  // Section headers
  {
    key: 'autocomplete-header-color-rgb',
    label: 'Section header color',
    type: 'color',
    default: '30, 89, 255',
    section: 'autocomplete',
    category: 'Section headers',
  },
];

export function getGlobalVariables(): ThemeVariable[] {
  return THEME_VARIABLES.filter((variable) => {
    return variable.section === 'global';
  });
}

export function getAutocompleteVariables(): ThemeVariable[] {
  return THEME_VARIABLES.filter((variable) => {
    return variable.section === 'autocomplete';
  });
}

export function groupByCategory(
  variables: ThemeVariable[]
): Array<{ category: string; variables: ThemeVariable[] }> {
  const groups: Array<{ category: string; variables: ThemeVariable[] }> = [];

  for (const variable of variables) {
    const existing = groups.find((group) => {
      return group.category === variable.category;
    });
    if (existing) {
      existing.variables.push(variable);
    } else {
      groups.push({ category: variable.category, variables: [variable] });
    }
  }

  return groups;
}
