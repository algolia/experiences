import { describe, it, expect } from 'vitest';

import { generateThemeCss } from '../generate-theme-css';

import type { ThemeVariable } from '../../types';

const variables: ThemeVariable[] = [
  {
    key: 'brand-color',
    label: 'Brand color',
    type: 'color',
    group: 'colors',
    default: { light: '30, 89, 255', dark: '110, 160, 255' },
    description: 'Primary brand color.',
  },
  {
    key: 'border-radius',
    label: 'Border radius',
    type: 'number',
    group: 'layout',
    default: '8',
    description: 'Corner rounding.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'number',
    group: 'colors',
    default: '0.8',
    description: 'Global opacity.',
  },
  {
    key: 'shadow',
    label: 'Shadow',
    type: 'shadow',
    group: 'effects',
    default: [
      {
        offsetX: 0,
        offsetY: 2,
        blur: 4,
        spread: 0,
        color: '0, 0, 0',
        opacity: 0.1,
      },
    ],
    description: 'Box shadow value.',
  },
];

describe('generateThemeCss', () => {
  it('outputs :root and dark mode blocks', () => {
    const css = generateThemeCss(variables);

    expect(css).toContain(':root {');
    expect(css).toContain(":root[data-theme='dark'], .dark {");
  });

  it('uses light defaults in the :root block', () => {
    const css = generateThemeCss(variables);

    expect(css).toContain('--ais-brand-color: 30, 89, 255;');
  });

  it('uses dark defaults in the dark mode block', () => {
    const css = generateThemeCss(variables);
    const darkBlock = css.split(":root[data-theme='dark'], .dark {")[1];

    expect(darkBlock).toContain('--ais-brand-color: 110, 160, 255;');
  });

  it('serializes shadow layers to CSS box-shadow syntax', () => {
    const css = generateThemeCss(variables);

    expect(css).toContain('--ais-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);');
  });

  it('uses the same shadow default for both modes when default is a flat array', () => {
    const css = generateThemeCss(variables);
    const [lightBlock, darkBlock] = css.split(
      ":root[data-theme='dark'], .dark {"
    );

    expect(lightBlock).toContain(
      '--ais-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);'
    );
    expect(darkBlock).toContain(
      '--ais-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);'
    );
  });

  it('appends the unit to numeric variables', () => {
    const css = generateThemeCss(variables);

    expect(css).toContain('--ais-border-radius: 8px;');
  });

  it('replaces defaults with string overrides', () => {
    const css = generateThemeCss(variables, {
      'brand-color': '255, 0, 0',
    });

    expect(css).toContain('--ais-brand-color: 255, 0, 0;');
    expect(css).not.toContain('--ais-brand-color: 30, 89, 255;');
  });

  it('replaces defaults with number overrides and appends the unit', () => {
    const css = generateThemeCss(variables, { 'border-radius': 16 });

    expect(css).toContain('--ais-border-radius: 16px;');
    expect(css).not.toContain('--ais-border-radius: 8px;');
  });

  it('accepts per-mode overrides', () => {
    const css = generateThemeCss(variables, {
      light: { 'brand-color': '0, 128, 0' },
      dark: { 'brand-color': '100, 255, 100' },
    });
    const [lightBlock, darkBlock] = css.split(
      ":root[data-theme='dark'], .dark {"
    );

    expect(lightBlock).toContain('--ais-brand-color: 0, 128, 0;');
    expect(darkBlock).toContain('--ais-brand-color: 100, 255, 100;');
  });

  it('does not append a unit to numbers without constraints', () => {
    const css = generateThemeCss(variables);

    expect(css).toContain('--ais-opacity: 0.8;');
    expect(css).not.toContain('--ais-opacity: 0.8px;');
  });

  it('ignores override keys that are not in the catalog', () => {
    const css = generateThemeCss(variables, {
      'nonexistent-key': 'foo',
    });

    expect(css).not.toContain('nonexistent-key');
  });

  it('keeps non-overridden variables at their defaults', () => {
    const css = generateThemeCss(variables, {
      'brand-color': '255, 0, 0',
    });

    expect(css).toContain('--ais-border-radius: 8px;');
    expect(css).toContain('--ais-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);');
  });

  it('serializes multi-layer shadows with comma separation', () => {
    const css = generateThemeCss(variables, {
      shadow: [
        {
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          spread: 1,
          color: '23, 23, 23',
          opacity: 0.05,
        },
        {
          offsetX: 0,
          offsetY: 6,
          blur: 16,
          spread: -4,
          color: '23, 23, 23',
          opacity: 0.15,
        },
      ],
    });

    expect(css).toContain(
      '--ais-shadow: 0px 0px 0px 1px rgba(23, 23, 23, 0.05), 0px 6px 16px -4px rgba(23, 23, 23, 0.15);'
    );
  });

  it('overrides replace default shadow layers', () => {
    const css = generateThemeCss(variables, {
      shadow: [
        {
          offsetX: 4,
          offsetY: 4,
          blur: 0,
          spread: 0,
          color: '10, 10, 10',
          opacity: 1,
        },
      ],
    });

    expect(css).toContain('--ais-shadow: 4px 4px 0px 0px rgba(10, 10, 10, 1);');
    expect(css).not.toContain('0px 2px 4px 0px');
  });
});
