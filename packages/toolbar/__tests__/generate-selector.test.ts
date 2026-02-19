import { afterEach, describe, expect, it } from 'vitest';

import { generateSelector } from '../src/utils/generate-selector';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('generateSelector', () => {
  it('returns #id for an element with an id', () => {
    document.body.innerHTML = '<div id="search"></div>';
    const el = document.getElementById('search')!;

    expect(generateSelector(el)).toBe('#search');
  });

  it('escapes special characters in ids', () => {
    document.body.innerHTML = '<div id="my.widget"></div>';
    const el = document.getElementById('my.widget')!;

    expect(generateSelector(el)).toBe('#my\\.widget');
  });

  it('returns a tag-based path for an element without an id', () => {
    document.body.innerHTML = '<main><p>Hello</p></main>';
    const el = document.querySelector('p')!;
    const selector = generateSelector(el);

    expect(document.querySelector(selector)).toBe(el);
  });

  it('uses nth-of-type when siblings share the same tag', () => {
    document.body.innerHTML = '<ul><li>A</li><li>B</li><li>C</li></ul>';
    const el = document.querySelectorAll('li')[1];
    const selector = generateSelector(el);

    expect(selector).toContain('nth-of-type(2)');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('stops at an ancestor with an id', () => {
    document.body.innerHTML = `
      <div id="root"><section><span>X</span></section></div>
      <div><section><span>Y</span></section></div>
    `;
    const el = document.querySelector('#root span')!;
    const selector = generateSelector(el);

    expect(selector.startsWith('#root')).toBe(true);
    expect(document.querySelector(selector)).toBe(el);
  });

  it('produces a unique selector for deeply nested elements', () => {
    document.body.innerHTML = `
      <div>
        <div><span>A</span></div>
        <div><span>B</span></div>
      </div>
    `;
    const spans = document.querySelectorAll('span');
    const selectorA = generateSelector(spans[0]);
    const selectorB = generateSelector(spans[1]);

    expect(document.querySelector(selectorA)).toBe(spans[0]);
    expect(document.querySelector(selectorB)).toBe(spans[1]);
    expect(selectorA).not.toBe(selectorB);
  });

  it('ignores the toolbar host element id', () => {
    document.body.innerHTML =
      '<div id="algolia-experiences-toolbar"><span>T</span></div>';
    const el = document.querySelector('#algolia-experiences-toolbar')!;
    const selector = generateSelector(el);

    expect(selector).not.toBe('#algolia-experiences-toolbar');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('prefers a class-based selector nested under a parent', () => {
    document.body.innerHTML =
      '<header><div class="nav-header"><span>X</span></div></header>';
    const el = document.querySelector('.nav-header')!;
    const selector = generateSelector(el);

    expect(selector).toBe('header > div.nav-header');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('uses class in the path when it helps disambiguate', () => {
    document.body.innerHTML = `
      <div>
        <div class="sidebar"><span>A</span></div>
        <div><span>B</span></div>
      </div>
    `;
    const el = document.querySelector('.sidebar span')!;
    const selector = generateSelector(el);

    expect(selector).toContain('sidebar');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('nests class selectors with a parent for uniqueness', () => {
    document.body.innerHTML = `
      <nav><div class="nav-actions">A</div></nav>
      <header><div class="nav-actions">B</div></header>
    `;
    const el = document.querySelector('header .nav-actions')!;
    const selector = generateSelector(el);

    expect(selector).toBe('header > div.nav-actions');
    expect(document.querySelector(selector)).toBe(el);
  });

  it('falls back to nth-of-type when classes are not unique', () => {
    document.body.innerHTML =
      '<ul><li class="item">A</li><li class="item">B</li></ul>';
    const el = document.querySelectorAll('li')[1];
    const selector = generateSelector(el);

    expect(selector).toContain('nth-of-type(2)');
    expect(document.querySelector(selector)).toBe(el);
  });
});
