import { useMemo, useState } from 'preact/hooks';

import type { ThemeOverrideValue, ThemePreset } from '@experiences/theme';
import { AUTOCOMPLETE_VARIABLES } from '@experiences/theme/autocomplete';

import { ChevronDown, Moon, Settings, Sparkles, Sun } from 'lucide-preact';

import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../ui/collapsible';
import type { ThemeMode } from './constants';
import {
  GROUP_LABELS,
  GROUP_ORDER,
  getCurrentValue,
  hasOverride,
} from './constants';
import { PresetSelector } from './preset-selector';
import { ThemeAgentChat } from './theme-agent-chat';
import { VariableField } from './variable-field';

type ThemeEditorProps = {
  themeOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  baselineOverrides: {
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
  hasTwoColumnLayout: boolean;
};

type ThemeView = 'generate' | 'customize';

export function ThemeEditor({
  themeOverrides,
  baselineOverrides,
  themeMode,
  onThemeVariableChange,
  onThemeVariableReset,
  onThemeResetAll,
  onThemeModeChange,
  themeModeConfig,
  onThemeModeConfigChange,
  onPresetApply,
  hasTwoColumnLayout,
}: ThemeEditorProps) {
  const [view, setView] = useState<ThemeView>('customize');
  const [autocompleteOpen, setAutocompleteOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    return new Set();
  });

  const currentOverrides = themeOverrides[themeMode];
  const currentBaseline = baselineOverrides[themeMode];

  const hasAnyOverrides = useMemo(() => {
    return (
      JSON.stringify(themeOverrides.light) !==
        JSON.stringify(baselineOverrides.light) ||
      JSON.stringify(themeOverrides.dark) !==
        JSON.stringify(baselineOverrides.dark)
    );
  }, [themeOverrides, baselineOverrides]);

  const groups = useMemo(() => {
    const hiddenKeys = new Set<string>();
    if (!hasTwoColumnLayout) {
      hiddenKeys.add('autocomplete-panel-columns');
      hiddenKeys.add('autocomplete-panel-columns-breakpoint');
    }

    const filtered = AUTOCOMPLETE_VARIABLES.filter((variable) => {
      return !hiddenKeys.has(variable.key);
    });

    const grouped = new Map<string, typeof AUTOCOMPLETE_VARIABLES>();
    for (const variable of filtered) {
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
  }, [hasTwoColumnLayout]);

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
    <div class="flex flex-1 flex-col overflow-hidden">
      {/* Global controls — always visible */}
      <div class="shrink-0 space-y-3 border-b px-4 py-3">
        <PresetSelector
          themeOverrides={themeOverrides}
          themeMode={themeMode}
          onPresetApply={onPresetApply}
        />
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
                  <Sun class="size-3.5" />
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
                  <Moon class="size-3.5" />
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
      </div>

      {/* View switcher */}
      <div class="shrink-0 px-4 pt-3">
        <div class="bg-muted inline-flex h-9 w-full rounded-lg p-1">
          <button
            type="button"
            class={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'customize'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
            onClick={() => {
              return setView('customize');
            }}
          >
            <Settings class="size-3.5" />
            Customize
          </button>
          <button
            type="button"
            class={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              view === 'generate'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
            onClick={() => {
              return setView('generate');
            }}
          >
            <Sparkles class="size-3.5" />
            Generate
          </button>
        </div>
      </div>

      {/* Generate view */}
      {view === 'generate' && <ThemeAgentChat />}

      {/* Customize view */}
      {view === 'customize' && (
        <div class="flex-1 overflow-y-auto p-4 pb-40 space-y-3">
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
              <ChevronDown
                class="size-4 text-muted-foreground transition-transform"
                style={{
                  transform: autocompleteOpen
                    ? 'rotate(180deg)'
                    : 'rotate(0deg)',
                }}
              />
            </CollapsibleTrigger>
            <CollapsibleContent open={autocompleteOpen}>
              <div class="space-y-3 pt-2">
                {groups.map(({ key, label, variables }) => {
                  const isOpen = expandedGroups.has(key);
                  const groupOverrideCount = variables.filter((variable) => {
                    return hasOverride(
                      variable,
                      currentOverrides,
                      currentBaseline
                    );
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
                          <ChevronDown
                            class="size-4 text-muted-foreground transition-transform"
                            style={{
                              transform: isOpen
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                            }}
                          />
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
                                  currentOverrides,
                                  currentBaseline
                                )}
                                onChange={(value) => {
                                  return onThemeVariableChange(
                                    variable.key,
                                    value
                                  );
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
      )}
    </div>
  );
}
