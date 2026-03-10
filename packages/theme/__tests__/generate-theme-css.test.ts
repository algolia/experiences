import { describe, it, expect } from 'vitest';

import { generateThemeCss } from '../src/lib/generate-theme-css';

import type { ThemeVariable } from '../src/types';

const variables: ThemeVariable[] = [
  {
    key: 'brand-color',
    label: 'Brand color',
    type: 'color',
    default: { light: '30, 89, 255', dark: '110, 160, 255' },
    description: 'Primary brand color.',
  },
  {
    key: 'border-radius',
    label: 'Border radius',
    type: 'number',
    default: '8',
    description: 'Corner rounding.',
    constraints: { min: 0, max: 32, step: 1, unit: 'px' },
  },
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'number',
    default: '0.8',
    description: 'Global opacity.',
  },
  {
    key: 'shadow',
    label: 'Shadow',
    type: 'text',
    default: '0 2px 4px rgba(0,0,0,0.1)',
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

  it('uses the same default for both modes when default is a string', () => {
    const css = generateThemeCss(variables);
    const [lightBlock, darkBlock] = css.split(
      ":root[data-theme='dark'], .dark {"
    );

    expect(lightBlock).toContain('--ais-shadow: 0 2px 4px rgba(0,0,0,0.1);');
    expect(darkBlock).toContain('--ais-shadow: 0 2px 4px rgba(0,0,0,0.1);');
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
    expect(css).toContain('--ais-shadow: 0 2px 4px rgba(0,0,0,0.1);');
  });
});
