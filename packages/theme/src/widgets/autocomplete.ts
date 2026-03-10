import { createThemeOverridesSchema } from '../lib/create-theme-overrides-schema';

import type { ThemeVariable } from '..';

export const AUTOCOMPLETE_VARIABLES: ThemeVariable[] = [
  // --- Colors ---
  {
    key: 'autocomplete-primary-color',
    label: 'Primary color',
    type: 'color',
    default: { light: '30, 89, 255', dark: '110, 160, 255' },
    description:
      'Primary brand color for interactive elements (focus ring, selected item, header).',
  },
  {
    key: 'autocomplete-primary-color-alpha',
    label: 'Primary color alpha',
    type: 'number',
    default: '1',
    description: 'Opacity of the primary color.',
  },
  {
    key: 'autocomplete-text-color',
    label: 'Text color',
    type: 'color',
    default: { light: '38, 38, 38', dark: '255, 255, 255' },
    description: 'Main text color for the autocomplete.',
  },
  {
    key: 'autocomplete-text-color-alpha',
    label: 'Text color alpha',
    type: 'number',
    default: '1',
    description: 'Opacity of the text color.',
  },
  {
    key: 'autocomplete-muted-color-alpha',
    label: 'Muted color alpha',
    type: 'number',
    default: '1',
    description:
      'Opacity for secondary elements (placeholder, clear button, item icons).',
  },
  {
    key: 'autocomplete-background-color',
    label: 'Background color',
    type: 'color',
    default: { light: '255, 255, 255', dark: '38, 38, 38' },
    description: 'Background color for the form and panel.',
  },
  {
    key: 'autocomplete-background-color-alpha',
    label: 'Background color alpha',
    type: 'number',
    default: '1',
    description: 'Opacity of the background color.',
  },
  {
    key: 'autocomplete-border-color',
    label: 'Border color',
    type: 'color',
    default: { light: '150, 150, 150', dark: '100, 100, 100' },
    description: 'Color for borders and dividers.',
  },
  {
    key: 'autocomplete-border-width',
    label: 'Border width',
    type: 'number',
    default: '1',
    description: 'Width of borders on the form, panel, and header line.',
    constraints: { min: 0, max: 4, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-overlay-color',
    label: 'Overlay color',
    type: 'color',
    default: '115, 114, 129',
    description: 'Backdrop overlay color in detached mode.',
  },
  {
    key: 'autocomplete-overlay-color-alpha',
    label: 'Overlay color alpha',
    type: 'number',
    default: '0.4',
    description: 'Opacity of the detached mode backdrop overlay.',
  },

  // --- Typography ---
  {
    key: 'autocomplete-base-unit',
    label: 'Base unit',
    type: 'number',
    default: '16',
    description: 'Base font size unit in pixels.',
  },
  {
    key: 'autocomplete-font-weight-medium',
    label: 'Medium font weight',
    type: 'text',
    default: '500',
    description: 'Font weight for item titles.',
  },

  // --- Icons ---
  {
    key: 'autocomplete-icon-size',
    label: 'Icon size',
    type: 'number',
    default: '20',
    description: 'Width and height of icons.',
    constraints: { min: 12, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-icon-stroke-width',
    label: 'Icon stroke width',
    type: 'number',
    default: '1.6',
    description: 'Stroke width for line icons.',
    constraints: { min: 1, max: 3, step: 0.1 },
  },

  // --- Transitions ---
  {
    key: 'autocomplete-transition-duration',
    label: 'Transition duration',
    type: 'text',
    default: '0.3s',
    description: 'Duration for hover and state transitions.',
  },
  {
    key: 'autocomplete-transition-timing-function',
    label: 'Transition timing',
    type: 'text',
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    description: 'Easing function for transitions.',
  },

  // --- Input ---
  {
    key: 'autocomplete-search-input-height',
    label: 'Search input height',
    type: 'number',
    default: '44',
    description: 'Height of the search input field.',
    constraints: { min: 32, max: 64, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-form-padding-left',
    label: 'Form padding left',
    type: 'number',
    default: '16',
    description: 'Left padding inside the form, before the search icon.',
    constraints: { min: 4, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-form-padding-right',
    label: 'Form padding right',
    type: 'number',
    default: '12',
    description: 'Right padding inside the form, after the clear button.',
    constraints: { min: 4, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-form-border-radius',
    label: 'Form border radius',
    type: 'number',
    default: '4',
    description: 'Border radius of the search form.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-form-border-opacity',
    label: 'Form border opacity',
    type: 'number',
    default: '0.8',
    description: 'Opacity of the search form border.',
  },
  {
    key: 'autocomplete-form-focus-ring-opacity',
    label: 'Focus ring opacity',
    type: 'number',
    default: '0.2',
    description: 'Opacity of the focus ring around the search form.',
  },
  {
    key: 'autocomplete-form-focus-ring-width',
    label: 'Focus ring width',
    type: 'number',
    default: '2',
    description: 'Width of the focus ring around the search form.',
    constraints: { min: 0, max: 8, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-search-icon-color',
    label: 'Search icon color',
    type: 'color',
    default: '30, 89, 255',
    description: 'Color of the search icon in the input.',
  },
  {
    key: 'autocomplete-placeholder-color',
    label: 'Placeholder color',
    type: 'color',
    default: '82, 82, 82',
    description: 'Color of the placeholder text in the input.',
  },
  {
    key: 'autocomplete-clear-button-color',
    label: 'Clear button color',
    type: 'color',
    default: '82, 82, 82',
    description: 'Color of the clear/reset button in the input.',
  },

  // --- Panel ---
  {
    key: 'autocomplete-panel-margin-top',
    label: 'Panel margin top',
    type: 'number',
    default: '8',
    description: 'Gap between the search form and the results panel.',
    constraints: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-max-height',
    label: 'Panel max height',
    type: 'number',
    default: '650',
    description: 'Maximum height of the autocomplete results panel.',
    constraints: { min: 200, max: 1000, step: 10, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-border-radius',
    label: 'Panel border radius',
    type: 'number',
    default: '4',
    description: 'Border radius of the results panel.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-shadow',
    label: 'Panel shadow',
    type: 'text',
    default:
      '0 0 0 1px rgba(23,23,23,0.05), 0 6px 16px -4px rgba(23,23,23,0.15)',
    description: 'Box shadow of the results panel.',
  },
  {
    key: 'autocomplete-panel-border-opacity',
    label: 'Panel border opacity',
    type: 'number',
    default: '0.2',
    description: 'Opacity of the panel border.',
  },
  {
    key: 'autocomplete-panel-gap',
    label: 'Panel gap',
    type: 'number',
    default: '8',
    description: 'Gap between sections in the panel.',
    constraints: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-panel-padding',
    label: 'Panel padding',
    type: 'number',
    default: '8',
    description: 'Inner padding of the panel.',
    constraints: { min: 0, max: 24, step: 1, unit: 'px' },
  },

  // --- Items ---
  {
    key: 'autocomplete-item-icon-box-size',
    label: 'Item icon box size',
    type: 'number',
    default: '28',
    description:
      'Width and height of the icon container box inside result items.',
    constraints: { min: 16, max: 48, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-border-radius',
    label: 'Item border radius',
    type: 'number',
    default: '4',
    description: 'Border radius of result items.',
    constraints: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-selected-opacity',
    label: 'Selected item opacity',
    type: 'number',
    default: '0.1',
    description: 'Background opacity of the selected/hovered item.',
  },
  {
    key: 'autocomplete-item-min-height',
    label: 'Item min height',
    type: 'number',
    default: '40',
    description: 'Minimum height of each result item.',
    constraints: { min: 24, max: 64, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-padding',
    label: 'Item padding',
    type: 'number',
    default: '4',
    description: 'Inner padding of each result item.',
    constraints: { min: 0, max: 16, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-gap',
    label: 'Item gap',
    type: 'number',
    default: '8',
    description: 'Gap between icon and text within an item.',
    constraints: { min: 0, max: 24, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-item-line-height',
    label: 'Item line height',
    type: 'text',
    default: '1.25em',
    description: 'Line height of item text.',
  },
  {
    key: 'autocomplete-item-icon-color',
    label: 'Item icon color',
    type: 'color',
    default: '82, 82, 82',
    description: 'Color of icons inside result items.',
  },
  {
    key: 'autocomplete-item-action-color',
    label: 'Item action color',
    type: 'color',
    default: '82, 82, 82',
    description: 'Color of action buttons inside result items.',
  },
  {
    key: 'autocomplete-highlight-weight',
    label: 'Highlight weight',
    type: 'text',
    default: '700',
    description: 'Font weight for highlighted/matched text.',
  },

  // --- Headers ---
  {
    key: 'autocomplete-header-color',
    label: 'Header color',
    type: 'color',
    default: '30, 89, 255',
    description: 'Color of section header text.',
  },
  {
    key: 'autocomplete-header-font-size',
    label: 'Header font size',
    type: 'text',
    default: '0.8em',
    description: 'Font size of section headers.',
  },
  {
    key: 'autocomplete-header-font-weight',
    label: 'Header font weight',
    type: 'text',
    default: '600',
    description: 'Font weight of section headers.',
  },
  {
    key: 'autocomplete-header-line-opacity',
    label: 'Header line opacity',
    type: 'number',
    default: '0.3',
    description: 'Opacity of the decorative line after section headers.',
  },

  // --- Detached ---
  {
    key: 'autocomplete-detached-modal-max-width',
    label: 'Detached modal max width',
    type: 'number',
    default: '680',
    description: 'Maximum width of the detached modal.',
    constraints: { min: 400, max: 1200, step: 10, unit: 'px' },
  },
  {
    key: 'autocomplete-detached-modal-max-height',
    label: 'Detached modal max height',
    type: 'number',
    default: '500',
    description: 'Maximum height of the detached modal.',
    constraints: { min: 300, max: 1000, step: 10, unit: 'px' },
  },
  {
    key: 'autocomplete-detached-modal-border-radius',
    label: 'Detached modal border radius',
    type: 'number',
    default: '8',
    description: 'Border radius of the detached modal.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-detached-modal-top',
    label: 'Detached modal top offset',
    type: 'text',
    default: '3%',
    description: 'Top offset of the detached modal from viewport.',
  },
  {
    key: 'autocomplete-detached-modal-shadow',
    label: 'Detached modal shadow',
    type: 'text',
    default:
      '0 0 0 1px rgba(23,23,23,0.05), 0 6px 16px -4px rgba(23,23,23,0.15)',
    description: 'Box shadow of the detached modal.',
  },
  {
    key: 'autocomplete-detached-form-border-opacity',
    label: 'Detached form border opacity',
    type: 'number',
    default: '0.3',
    description: 'Opacity of the form border in detached mode.',
  },

  // --- Scrollbar ---
  {
    key: 'autocomplete-scrollbar-width',
    label: 'Scrollbar width',
    type: 'number',
    default: '6',
    description: 'Width of custom scrollbars in the panel.',
    constraints: { min: 2, max: 12, step: 1, unit: 'px' },
  },
  {
    key: 'autocomplete-scrollbar-color-mix',
    label: 'Scrollbar color mix',
    type: 'text',
    default: '40%',
    description:
      'How much of the text color to mix into the scrollbar track color.',
  },
];

export const autocompleteOverridesSchema = createThemeOverridesSchema(
  AUTOCOMPLETE_VARIABLES
);
