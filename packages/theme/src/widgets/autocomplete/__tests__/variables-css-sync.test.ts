import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, test } from 'vitest';

import { AUTOCOMPLETE_PRESETS } from '../presets';
import { AUTOCOMPLETE_VARIABLES } from '../variables';

// Variables declared in AUTOCOMPLETE_VARIABLES but not referenced in CSS files
const ALLOWED_UNUSED = new Set([
  'autocomplete-panel-columns-breakpoint', // Used in JS to emit a responsive @media rule
]);

describe('autocomplete CSS ↔ variables sync', () => {
  const cssVars = extractCssVariables();
  const declaredVars = extractDeclaredVariables();

  test('every CSS variable has a declaration in `AUTOCOMPLETE_VARIABLES`', () => {
    const undeclared = [...cssVars].filter((variable) => {
      return !declaredVars.has(variable);
    });

    expect(undeclared).toEqual([]);
  });

  test('every `AUTOCOMPLETE_VARIABLES` entry is used in CSS', () => {
    const unused = [...declaredVars].filter((variable) => {
      return !cssVars.has(variable) && !ALLOWED_UNUSED.has(variable);
    });

    expect(unused).toEqual([]);
  });
});

describe('autocomplete color alpha declarations', () => {
  const declaredVars = extractDeclaredVariables();
  const colorVarsWithoutAlpha = AUTOCOMPLETE_VARIABLES.filter((variable) => {
    return variable.type === 'color' && !variable.alpha;
  });
  const colorVarsWithAlpha = AUTOCOMPLETE_VARIABLES.filter((variable) => {
    return variable.type === 'color' && variable.alpha;
  });

  test('every color variable with an `alpha` points to an existing variable', () => {
    const missing = colorVarsWithAlpha.filter((variable) => {
      return !declaredVars.has(variable.alpha!);
    });

    expect(
      missing.map((variable) => {
        return `${variable.key} → ${variable.alpha}`;
      })
    ).toEqual([]);
  });

  test('every color variable with an `alpha` points to a number variable', () => {
    const nonNumber = colorVarsWithAlpha.filter((variable) => {
      const target = AUTOCOMPLETE_VARIABLES.find((candidate) => {
        return candidate.key === variable.alpha;
      });
      return target && target.type !== 'number';
    });

    expect(
      nonNumber.map((variable) => {
        return `${variable.key} → ${variable.alpha}`;
      })
    ).toEqual([]);
  });

  test('color variables without `alpha` are intentional (allowlist)', () => {
    // Variables in this set are brand tokens or otherwise don't need a companion.
    const ALLOWED_NO_ALPHA = new Set<string>([]);

    const unexpected = colorVarsWithoutAlpha.filter((variable) => {
      return !ALLOWED_NO_ALPHA.has(variable.key);
    });

    expect(
      unexpected.map((variable) => {
        return variable.key;
      })
    ).toEqual([]);
  });
});

describe('autocomplete presets ↔ variables sync', () => {
  const presetVars = extractPresetVariables();
  const declaredVars = extractDeclaredVariables();

  test('every preset key has a declaration in `AUTOCOMPLETE_VARIABLES`', () => {
    const undeclared = [...presetVars].filter((variable) => {
      return !declaredVars.has(variable);
    });

    expect(undeclared).toEqual([]);
  });
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_DIR = resolve(__dirname, '..', 'css');

const CSS_FILES = readdirSync(CSS_DIR).filter((file) => {
  return file.endsWith('.css');
});

function extractCssVariables(): Set<string> {
  const variables = new Set<string>();

  for (const file of CSS_FILES) {
    const css = readFileSync(resolve(CSS_DIR, file), 'utf-8');

    for (const match of css.matchAll(/var\(--ais-(autocomplete-[\w-]+)/g)) {
      variables.add(match[1]!);
    }
  }

  return variables;
}

function extractDeclaredVariables(): Set<string> {
  return new Set(
    AUTOCOMPLETE_VARIABLES.map(({ key }) => {
      return key;
    })
  );
}

function extractPresetVariables(): Set<string> {
  const variables = new Set<string>();

  for (const preset of AUTOCOMPLETE_PRESETS) {
    for (const mode of Object.values(preset.overrides)) {
      for (const key of Object.keys(mode)) {
        variables.add(key);
      }
    }
  }

  return variables;
}
