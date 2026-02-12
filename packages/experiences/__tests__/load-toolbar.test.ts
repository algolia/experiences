import { afterEach, describe, expect, it } from 'vitest';
import { loadToolbar } from '../src/entries/preview';

describe('loadToolbar', () => {
  afterEach(() => {
    delete window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__;
    document.head.querySelectorAll('script').forEach((s) => s.remove());
  });

  it('sets the toolbar config on window', () => {
    loadToolbar('http://cdn.example.com/runtime.js', {
      appId: 'app123',
      apiKey: 'key456',
      experienceId: 'exp789',
      env: 'beta',
    });

    expect(window.__ALGOLIA_EXPERIENCES_TOOLBAR_CONFIG__).toEqual({
      appId: 'app123',
      apiKey: 'key456',
      experienceId: 'exp789',
      env: 'beta',
    });
  });

  it('injects a script tag with toolbar.js URL', () => {
    loadToolbar('http://cdn.example.com/runtime.js', {
      appId: 'app123',
      apiKey: 'key456',
      experienceId: 'exp789',
    });

    const script = document.head.querySelector('script');
    expect(script).not.toBeNull();
    expect(script!.src).toBe('http://cdn.example.com/toolbar.js');
  });

  it('attaches an onerror handler to the script', () => {
    loadToolbar('http://cdn.example.com/runtime.js', {
      appId: 'app123',
      apiKey: 'key456',
      experienceId: 'exp789',
    });

    const script = document.head.querySelector('script');
    expect(script!.onerror).toBeTypeOf('function');
  });
});
