import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'path';

import {
  type SearchResponse,
  RESPONSE_RESULTS_WITH_IMAGES,
  RESPONSE_RESULTS_WITH_QS,
  RESPONSE_RESULTS_WITHOUT_IMAGES,
  RESPONSE_NO_RESULTS,
} from './fixtures/algolia-responses';
import {
  type ExperienceConfig,
  AUTOCOMPLETE_WITH_IMAGES,
  AUTOCOMPLETE_WITH_QS_AND_RS,
  AUTOCOMPLETE_WITHOUT_IMAGES,
  AUTOCOMPLETE_DETACHED,
  AUTOCOMPLETE_NO_RESULTS,
} from './fixtures/experience-configs';

import { AUTOCOMPLETE_PRESETS } from '../theme/src/widgets/autocomplete/presets';

const RUNTIME_BUNDLE = resolve(__dirname, '../runtime/dist/runtime.js');
const HARNESS_PATH = resolve(__dirname, 'fixtures/autocomplete.html');

type PresetMode = 'light' | 'dark';

const presetMatrix: Array<[string, PresetMode]> = AUTOCOMPLETE_PRESETS.flatMap(
  (preset) => {
    return (['light', 'dark'] as const).map((mode) => {
      return [preset.name, mode] as [string, PresetMode];
    });
  }
);

// Upstream InstantSearch.js ARIA issues, not fixable in our theme/templates.
const UPSTREAM_ARIA_RULES = [
  'aria-required-children',
  'aria-required-parent',
  'list',
];

test.describe('autocomplete theme presets accessibility', () => {
  for (const [presetName, mode] of presetMatrix) {
    test.describe(`${presetName} / ${mode}`, () => {
      test('products with images has no axe violations', async ({ page }) => {
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_WITH_IMAGES,
          searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
          presetName,
          mode,
        });
        await openPanel(page);

        const violations = await runAxe(page);
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });

      test('articles without images has no axe violations', async ({
        page,
      }) => {
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_WITHOUT_IMAGES,
          searchResponse: RESPONSE_RESULTS_WITHOUT_IMAGES,
          presetName,
          mode,
        });
        await openPanel(page);

        const violations = await runAxe(page);
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });

      test('recent searches and query suggestions has no axe violations', async ({
        page,
      }) => {
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_WITH_QS_AND_RS,
          searchResponse: RESPONSE_RESULTS_WITH_QS,
          presetName,
          mode,
        });
        await openPanel(page);

        const violations = await runAxe(page);
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });

      test('no results state has no axe violations', async ({ page }) => {
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_NO_RESULTS,
          searchResponse: RESPONSE_NO_RESULTS,
          presetName,
          mode,
        });
        await openPanel(page);

        const violations = await runAxe(page);
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });

      test('detached mobile (full-screen) has no axe violations', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_DETACHED,
          searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
          presetName,
          mode,
        });
        await openDetachedPanel(page);

        const violations = await runAxe(
          page,
          '.ais-AutocompleteDetachedContainer'
        );
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });

      test('detached modal (desktop) has no axe violations', async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await setupAutocomplete(page, {
          experienceConfig: AUTOCOMPLETE_DETACHED,
          searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
          presetName,
          mode,
        });
        await openDetachedPanel(page);

        const violations = await runAxe(
          page,
          '.ais-AutocompleteDetachedContainer'
        );
        expect(violations, formatViolations(violations)).toHaveLength(0);
      });
    });
  }

  test.describe('ARIA patterns', () => {
    test('combobox pattern is correctly wired', async ({ page }) => {
      await setupAutocomplete(page, {
        experienceConfig: AUTOCOMPLETE_WITH_IMAGES,
        searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
      });
      await openPanel(page);

      const input = page.locator('.ais-Autocomplete input[type="search"]');
      await expect(input).toBeVisible();

      const expanded = await page.locator('[aria-expanded="true"]').first();
      await expect(expanded).toBeVisible();
    });

    test('at most one item has aria-selected="true"', async ({ page }) => {
      await setupAutocomplete(page, {
        experienceConfig: AUTOCOMPLETE_WITH_IMAGES,
        searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
      });
      await openPanel(page);

      const input = page.locator('.ais-Autocomplete input[type="search"]');
      await input.press('ArrowDown');

      const selectedItems = await page
        .locator('[aria-selected="true"]')
        .count();
      expect(selectedItems).toBeLessThanOrEqual(1);
    });

    test('decorative SVGs are hidden from assistive technology', async ({
      page,
    }) => {
      await setupAutocomplete(page, {
        experienceConfig: AUTOCOMPLETE_NO_RESULTS,
        searchResponse: RESPONSE_NO_RESULTS,
      });
      await openPanel(page);

      const svgs = page.locator('.ais-AutocompleteNoResults svg');
      const count = await svgs.count();

      for (let i = 0; i < count; i++) {
        const ariaHidden = await svgs.nth(i).getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    });

    test('images have alt attributes', async ({ page }) => {
      await setupAutocomplete(page, {
        experienceConfig: AUTOCOMPLETE_WITH_IMAGES,
        searchResponse: RESPONSE_RESULTS_WITH_IMAGES,
      });
      await openPanel(page);

      const images = page.locator('.ais-AutocompleteListItemImage');
      const count = await images.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });
  });
});

function stringifyOverrides(
  overrides: Record<string, unknown>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => {
      return [key, typeof value === 'string' ? value : JSON.stringify(value)];
    })
  );
}

async function setupAutocomplete(
  page: import('@playwright/test').Page,
  options: {
    experienceConfig: ExperienceConfig;
    searchResponse: SearchResponse;
    presetName?: string;
    mode?: PresetMode;
  }
) {
  const preset = AUTOCOMPLETE_PRESETS.find(({ name }) => {
    return name === (options.presetName ?? 'Default');
  })!;
  const mode = options.mode ?? 'light';

  const cssVariables = {
    light: stringifyOverrides(preset.overrides.light),
    dark: stringifyOverrides(preset.overrides.dark),
  };
  const configWithTheme = {
    ...options.experienceConfig,
    cssVariables,
  };

  await page.route('**/*algolia.net/**', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(options.searchResponse),
    });
  });

  await page.goto(`file://${HARNESS_PATH}`);

  if (mode === 'dark') {
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
  }

  await page.evaluate((config) => {
    (window as any).__TEST_CONFIG__ = {
      experienceConfig: config,
    };
  }, configWithTheme);

  await page.addScriptTag({ path: RUNTIME_BUNDLE });

  await page.evaluate(() => {
    return (window as any).__boot();
  });

  await page.waitForSelector('.ais-Autocomplete', { timeout: 10000 });
}

async function openPanel(page: import('@playwright/test').Page) {
  const input = page.locator('.ais-Autocomplete input[type="search"]');
  await input.focus();
  await input.fill('test');

  await page.waitForSelector('.ais-AutocompletePanel', { timeout: 10000 });
  await page.waitForTimeout(500);
}

async function openDetachedPanel(page: import('@playwright/test').Page) {
  const searchButton = page.locator('.ais-AutocompleteDetachedSearchButton');
  await searchButton.click();

  await page.waitForSelector('.ais-AutocompleteDetachedContainer', {
    timeout: 10000,
  });

  const input = page.locator(
    '.ais-AutocompleteDetachedContainer input[type="search"]'
  );
  await input.fill('test');

  await page.waitForSelector('.ais-AutocompletePanel', { timeout: 10000 });
  await page.waitForTimeout(500);
}

async function runAxe(
  page: import('@playwright/test').Page,
  selector = '.ais-Autocomplete'
) {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .disableRules(UPSTREAM_ARIA_RULES)
    .analyze();

  return results.violations;
}

function formatViolations(
  violations: Awaited<ReturnType<typeof runAxe>>
): string {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => {
          return `  - ${node.html}\n    ${node.failureSummary}`;
        })
        .join('\n');
      return `[${violation.id}] ${violation.help} (${violation.impact})\n${nodes}`;
    })
    .join('\n\n');
}
