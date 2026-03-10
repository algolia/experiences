import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import type {
  ShadowLayer,
  ThemeOverrideValue,
  ThemePreset,
  ThemeVariable,
} from '@experiences/theme';
import { isShadowLayers } from '@experiences/theme';
import { AUTOCOMPLETE_VARIABLES } from '@experiences/theme/autocomplete';
import { AUTOCOMPLETE_PRESETS } from '@experiences/theme/autocomplete-presets';

import { rgbTripletToHex, hexToRgbTriplet } from '../utils/css-colors';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from './ui/collapsible';
import { SliderField } from './fields/slider-field';
import { ShadowField } from './fields/shadow-field';

type ThemeMode = 'light' | 'dark';

type ThemeEditorProps = {
  themeOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  themeMode: ThemeMode;
  onThemeVariableChange: (key: string, value: ThemeOverrideValue) => void;
  onThemeVariableReset: (key: string) => void;
  onThemeResetAll: () => void;
  onThemeModeChange: (mode: ThemeMode) => void;
  themeModeConfig: 'adaptive' | 'fixed';
  onThemeModeConfigChange: (modeConfig: 'adaptive' | 'fixed') => void;
  onPresetApply: (preset: ThemePreset) => void;
};

const GROUP_LABELS: Record<string, string> = {
  colors: 'Colors',
  typography: 'Typography',
  icons: 'Icons',
  transitions: 'Transitions',
  input: 'Input',
  panel: 'Panel',
  items: 'Items',
  headers: 'Headers',
  detached: 'Detached',
  scrollbar: 'Scrollbar',
};

const GROUP_ORDER = [
  'colors',
  'typography',
  'icons',
  'transitions',
  'input',
  'panel',
  'items',
  'headers',
  'detached',
  'scrollbar',
];

const SWATCH_KEYS = [
  'autocomplete-primary-color',
  'autocomplete-background-color',
  'autocomplete-text-color',
  'autocomplete-border-color',
] as const;

const CATALOG_DEFAULTS: Record<string, Record<ThemeMode, string>> = {};
for (const variable of AUTOCOMPLETE_VARIABLES) {
  if (variable.type === 'color') {
    if (typeof variable.default === 'string') {
      CATALOG_DEFAULTS[variable.key] = {
        light: variable.default,
        dark: variable.default,
      };
    } else if (!Array.isArray(variable.default)) {
      CATALOG_DEFAULTS[variable.key] = variable.default as {
        light: string;
        dark: string;
      };
    }
  }
}

function getSwatchColors(
  overrides: Record<string, ThemeOverrideValue>,
  mode: ThemeMode
): string[] {
  return SWATCH_KEYS.map((key) => {
    const value = overrides[key];
    if (typeof value === 'string') {
      return rgbTripletToHex(value);
    }
    const defaults = CATALOG_DEFAULTS[key];
    return defaults ? rgbTripletToHex(defaults[mode]) : '#888888';
  });
}

function findMatchingPreset(themeOverrides: {
  light: Record<string, ThemeOverrideValue>;
  dark: Record<string, ThemeOverrideValue>;
}): string | null {
  for (const preset of AUTOCOMPLETE_PRESETS) {
    const lightMatch = overridesMatch(
      themeOverrides.light,
      preset.overrides.light
    );
    const darkMatch = overridesMatch(
      themeOverrides.dark,
      preset.overrides.dark
    );
    if (lightMatch && darkMatch) {
      return preset.name;
    }
  }
  return null;
}

function overridesMatch(
  actual: Record<string, ThemeOverrideValue>,
  expected: Record<string, ThemeOverrideValue>
): boolean {
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  if (actualKeys.length !== expectedKeys.length) return false;
  for (const key of expectedKeys) {
    if (!(key in actual)) return false;
    if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key]))
      return false;
  }
  return true;
}

type PresetSelectorProps = {
  themeOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  themeMode: ThemeMode;
  onPresetApply: (preset: ThemePreset) => void;
};

function PresetSelector({
  themeOverrides,
  themeMode,
  onPresetApply,
}: PresetSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePresetName = useMemo(() => {
    return findMatchingPreset(themeOverrides);
  }, [themeOverrides]);

  const currentSwatches = useMemo(() => {
    return getSwatchColors(themeOverrides[themeMode], themeMode);
  }, [themeOverrides, themeMode]);

  useEffect(() => {
    if (!open) return;

    const root = containerRef.current?.getRootNode() as
      | ShadowRoot
      | Document
      | undefined;
    if (!root) return;

    const handleClickOutside = (event: Event) => {
      const target = event.composedPath()[0] as Node | undefined;
      if (
        target &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    root.addEventListener('mousedown', handleClickOutside);
    return () => {
      return root.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div class="relative" ref={containerRef}>
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
        onClick={() => {
          return setOpen((prev) => {
            return !prev;
          });
        }}
      >
        <div class="flex items-center gap-1">
          {currentSwatches.map((color, index) => {
            return (
              <span
                key={index}
                class="size-3 rounded-full border border-black/10"
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
        <span class="flex-1 text-left font-medium">
          {activePresetName ?? 'Custom'}
        </span>
        <svg
          class="size-4 text-muted-foreground transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div class="absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg">
          {AUTOCOMPLETE_PRESETS.map((preset) => {
            const swatches = getSwatchColors(
              preset.overrides[themeMode],
              themeMode
            );
            const isActive = activePresetName === preset.name;

            return (
              <button
                key={preset.name}
                type="button"
                class={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  isActive ? 'bg-accent/50' : ''
                }`}
                onClick={() => {
                  onPresetApply(preset);
                  setOpen(false);
                }}
              >
                <div class="flex items-center gap-1">
                  {swatches.map((color, index) => {
                    return (
                      <span
                        key={index}
                        class="size-3 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
                <span
                  class={`flex-1 text-left ${isActive ? 'font-medium' : ''}`}
                >
                  {preset.name}
                </span>
                {isActive && (
                  <svg
                    class="size-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDefault(
  variable: ThemeVariable,
  mode: ThemeMode
): string | ShadowLayer[] {
  if (typeof variable.default === 'string' || Array.isArray(variable.default)) {
    return variable.default;
  }

  return variable.default[mode];
}

function getCurrentValue(
  variable: ThemeVariable,
  overrides: Record<string, ThemeOverrideValue>,
  mode: ThemeMode
): ThemeOverrideValue {
  return overrides[variable.key] ?? getDefault(variable, mode);
}

function hasOverride(
  variable: ThemeVariable,
  overrides: Record<string, ThemeOverrideValue>
): boolean {
  return variable.key in overrides;
}

export function ThemeEditor({
  themeOverrides,
  themeMode,
  onThemeVariableChange,
  onThemeVariableReset,
  onThemeResetAll,
  onThemeModeChange,
  themeModeConfig,
  onThemeModeConfigChange,
  onPresetApply,
}: ThemeEditorProps) {
  const [autocompleteOpen, setAutocompleteOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    return new Set(['colors']);
  });

  const currentOverrides = themeOverrides[themeMode];

  const hasAnyOverrides =
    Object.keys(themeOverrides.light).length > 0 ||
    Object.keys(themeOverrides.dark).length > 0;

  const groups = useMemo(() => {
    const grouped = new Map<string, ThemeVariable[]>();
    for (const variable of AUTOCOMPLETE_VARIABLES) {
      const existing = grouped.get(variable.group) ?? [];
      existing.push(variable);
      grouped.set(variable.group, existing);
    }
    return GROUP_ORDER.filter((key) => {
      return grouped.has(key);
    }).map((key) => {
      return {
        key,
        label: GROUP_LABELS[key] ?? key,
        variables: grouped.get(key)!,
      };
    });
  }, []);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div class="space-y-3">
      {/* Preset selector */}
      <PresetSelector
        themeOverrides={themeOverrides}
        themeMode={themeMode}
        onPresetApply={onPresetApply}
      />

      {/* Mode controls */}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="bg-muted inline-flex h-8 rounded-lg p-1">
            <button
              type="button"
              class={`inline-flex items-center rounded-md px-3 text-xs font-medium transition-all ${
                themeModeConfig === 'adaptive'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
              onClick={() => {
                return onThemeModeConfigChange('adaptive');
              }}
            >
              Adaptive
            </button>
            <button
              type="button"
              class={`inline-flex items-center rounded-md px-3 text-xs font-medium transition-all ${
                themeModeConfig === 'fixed'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
              onClick={() => {
                return onThemeModeConfigChange('fixed');
              }}
            >
              Fixed
            </button>
          </div>
          {themeModeConfig === 'adaptive' && (
            <div class="bg-muted inline-flex h-8 rounded-lg p-1">
              <button
                type="button"
                class={`inline-flex items-center rounded-md px-3 text-xs font-medium transition-all ${
                  themeMode === 'light'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                onClick={() => {
                  return onThemeModeChange('light');
                }}
              >
                <svg
                  class="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </button>
              <button
                type="button"
                class={`inline-flex items-center rounded-md px-3 text-xs font-medium transition-all ${
                  themeMode === 'dark'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
                onClick={() => {
                  return onThemeModeChange('dark');
                }}
              >
                <svg
                  class="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasAnyOverrides}
          onClick={onThemeResetAll}
          class="text-xs"
        >
          Reset all
        </Button>
      </div>

      {/* Autocomplete variables */}
      <Collapsible open={autocompleteOpen}>
        <CollapsibleTrigger
          aria-expanded={autocompleteOpen}
          onClick={() => {
            return setAutocompleteOpen((prev) => {
              return !prev;
            });
          }}
          class="justify-between px-1 py-1"
        >
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Autocomplete
          </h3>
          <svg
            class="size-4 text-muted-foreground transition-transform"
            style={{
              transform: autocompleteOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent open={autocompleteOpen}>
          <div class="space-y-3 pt-2">
            {groups.map(({ key, label, variables }) => {
              const isOpen = expandedGroups.has(key);
              const groupOverrideCount = variables.filter((variable) => {
                return hasOverride(variable, currentOverrides);
              }).length;

              return (
                <Collapsible key={key} open={isOpen}>
                  <CollapsibleTrigger
                    aria-expanded={isOpen}
                    onClick={() => {
                      return toggleGroup(key);
                    }}
                    class="justify-between rounded-md border px-3 py-2 hover:bg-accent"
                  >
                    <span class="text-sm font-medium">{label}</span>
                    <div class="flex items-center gap-2">
                      {groupOverrideCount > 0 && (
                        <span class="inline-flex items-center rounded-full bg-primary/10 px-2 text-[11px] font-medium text-primary leading-5">
                          {groupOverrideCount} changed
                        </span>
                      )}
                      <svg
                        class="size-4 text-muted-foreground transition-transform"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent open={isOpen}>
                    <div class="space-y-3 pt-2">
                      {variables.map((variable) => {
                        return (
                          <VariableField
                            key={variable.key}
                            variable={variable}
                            value={getCurrentValue(
                              variable,
                              currentOverrides,
                              themeMode
                            )}
                            isOverridden={hasOverride(
                              variable,
                              currentOverrides
                            )}
                            onChange={(value) => {
                              return onThemeVariableChange(variable.key, value);
                            }}
                            onReset={() => {
                              return onThemeVariableReset(variable.key);
                            }}
                          />
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

type VariableFieldProps = {
  variable: ThemeVariable;
  value: ThemeOverrideValue;
  isOverridden: boolean;
  onChange: (value: ThemeOverrideValue) => void;
  onReset: () => void;
};

function VariableField({
  variable,
  value,
  isOverridden,
  onChange,
  onReset,
}: VariableFieldProps) {
  const resetButton = isOverridden ? (
    <button
      type="button"
      onClick={onReset}
      class="text-muted-foreground hover:text-foreground ml-1 shrink-0"
      aria-label={`Reset ${variable.label}`}
      title="Reset to default"
    >
      <svg
        class="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  ) : null;

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <Label>{variable.label}</Label>
        <div class="flex items-center gap-1">
          {variable.type === 'number' && (
            <span class="text-muted-foreground text-xs font-mono">
              {value}
              {variable.constraints?.unit ?? ''}
            </span>
          )}
          {resetButton}
        </div>
      </div>
      {variable.type === 'color' && (
        <ThemeColorField
          value={String(value)}
          onInput={(val) => {
            return onChange(val);
          }}
        />
      )}
      {variable.type === 'number' && (
        <SliderField
          value={Number(value)}
          min={variable.constraints?.min ?? 0}
          max={variable.constraints?.max ?? 100}
          step={
            variable.constraints?.step ??
            ((variable.constraints?.max ?? 100) <= 1 ? 0.01 : 1)
          }
          onInput={(val) => {
            return onChange(val);
          }}
        />
      )}
      {variable.type === 'shadow' && isShadowLayers(value) && (
        <ShadowField
          layers={value}
          onInput={(val) => {
            return onChange(val);
          }}
        />
      )}
      {variable.type === 'text' && (
        <ThemeTextField
          value={String(value)}
          onInput={(val) => {
            return onChange(val);
          }}
        />
      )}
      <p class="text-[11px] text-muted-foreground mt-1">
        {variable.description}
      </p>
    </div>
  );
}

type ThemeColorFieldProps = {
  value: string;
  onInput: (value: string) => void;
};

function ThemeColorField({ value, onInput }: ThemeColorFieldProps) {
  const hexValue = rgbTripletToHex(value);

  return (
    <div class="flex items-center gap-2">
      <input
        type="color"
        value={hexValue}
        onInput={(event) => {
          return onInput(
            hexToRgbTriplet((event.target as HTMLInputElement).value)
          );
        }}
        class="size-8 shrink-0 cursor-pointer rounded border border-input p-0.5"
      />
      <Input
        value={value}
        onInput={(event) => {
          return onInput((event.target as HTMLInputElement).value);
        }}
        class="font-mono text-xs"
      />
    </div>
  );
}

type ThemeTextFieldProps = {
  value: string;
  onInput: (value: string) => void;
};

function ThemeTextField({ value, onInput }: ThemeTextFieldProps) {
  return (
    <Input
      value={value}
      onInput={(event) => {
        return onInput((event.target as HTMLInputElement).value);
      }}
      class="text-xs"
    />
  );
}
