import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import type { ThemeOverrideValue } from '@experiences/theme';
import { generateThemeCss, THEME_STYLE_ATTR } from '@experiences/theme';
import { AUTOCOMPLETE_VARIABLES } from '@experiences/theme/autocomplete';

import { saveExperience } from '../api';
import { useElementPicker } from '../hooks/use-element-picker';
import { ToolbarProvider } from '../lib/toolbar-context';
import { sanitizeExperience, withAutocompleteFocus } from '../lib/utils';
import type {
  AddBlockResult,
  BlockPath,
  Environment,
  ExperienceApiBlock,
  ExperienceApiResponse,
  SaveState,
  ToolbarConfig,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { Panel } from './panel';
import { Pill } from './pill';

type AppProps = {
  config: ToolbarConfig;
  initialExperience: ExperienceApiResponse;
};

const DASHBOARD_BASE_URLS: Record<Environment, string> = {
  beta: 'https://beta-dashboard.algolia.com',
  prod: 'https://dashboard.algolia.com',
};

function getDashboardBase(env: Environment): string {
  const override = process.env.DASHBOARD_BASE;
  return override || DASHBOARD_BASE_URLS[env];
}

// oxlint-disable-next-line id-length
function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i]!)) return i;
  }
  return -1;
}

function updateBlockAtPath(
  blocks: ExperienceApiBlock[],
  path: BlockPath,
  updater: (block: ExperienceApiBlock) => ExperienceApiBlock
): ExperienceApiBlock[] {
  if (path.length === 1) {
    return blocks.map((block, idx) => {
      return idx === path[0] ? updater(block) : block;
    });
  }
  const [parentIdx, childIdx] = path;
  return blocks.map((block, idx) => {
    return idx === parentIdx
      ? {
          ...block,
          children: (block.children ?? []).map((child, ci) => {
            return ci === childIdx ? updater(child) : child;
          }),
        }
      : block;
  });
}

function deleteBlockAtPath(
  blocks: ExperienceApiBlock[],
  path: BlockPath
): ExperienceApiBlock[] {
  if (path.length === 1) {
    return blocks.filter((_, idx) => {
      return idx !== path[0];
    });
  }
  const [parentIdx, childIdx] = path;
  return blocks.map((block, idx) => {
    return idx === parentIdx
      ? {
          ...block,
          children: (block.children ?? []).filter((_, ci) => {
            return ci !== childIdx;
          }),
        }
      : block;
  });
}

export function changeWidgetIndex(
  blocks: ExperienceApiBlock[],
  widgetPath: BlockPath,
  targetIndexName: string
): ExperienceApiBlock[] {
  if (widgetPath.length !== 2) return blocks;
  const [srcParent, srcChild] = widgetPath;

  const widget = blocks[srcParent]?.children?.[srcChild];
  if (!widget) return blocks;

  // No-op if moving to the same index
  const srcIndexName = blocks[srcParent]?.parameters.indexName as string;
  if (srcIndexName === targetIndexName) return blocks;

  // Find existing target index block by name
  const targetIdx = blocks.findIndex((block) => {
    return (
      block.type === 'ais.index' &&
      (block.parameters.indexName as string) === targetIndexName
    );
  });

  // Remove widget from source
  let result = deleteBlockAtPath(blocks, widgetPath);

  // If source index is now empty, remove it
  const sourceBlock = result[srcParent];
  if (
    sourceBlock?.type === 'ais.index' &&
    (sourceBlock.children?.length ?? 0) === 0
  ) {
    result = result.filter((_, idx) => {
      return idx !== srcParent;
    });
  }

  // Sync sortBy first item to new index name
  let widgetToAdd = widget;
  if (widget.type === 'ais.sortBy') {
    const items = Array.isArray(widget.parameters.items)
      ? (widget.parameters.items as Array<Record<string, string>>)
      : [];
    if (items.length > 0) {
      widgetToAdd = {
        ...widget,
        parameters: {
          ...widget.parameters,
          items: items.map((item, idx) => {
            return idx === 0 ? { ...item, value: targetIndexName } : item;
          }),
        },
      };
    }
  }

  if (targetIdx !== -1) {
    // Adjust target index after potential source removal
    const adjustedTarget =
      sourceBlock?.type === 'ais.index' &&
      (sourceBlock.children?.length ?? 0) === 0 &&
      targetIdx > srcParent
        ? targetIdx - 1
        : targetIdx;

    return result.map((bl, idx) => {
      return idx === adjustedTarget
        ? { ...bl, children: [...(bl.children ?? []), widgetToAdd] }
        : bl;
    });
  }

  // Create new index block with the target name
  return [
    ...result,
    {
      type: 'ais.index',
      parameters: { indexName: targetIndexName, indexId: '' },
      children: [widgetToAdd],
    },
  ];
}

export function App({ config, initialExperience }: AppProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [experience, setExperience] = useState(initialExperience);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [themeModeConfig, setThemeModeConfig] = useState<'adaptive' | 'fixed'>(
    () => {
      const css = initialExperience.cssVariables;
      // Flat overrides (no light/dark keys) means fixed mode
      if (css && typeof css === 'object' && !('light' in css)) {
        return 'fixed';
      }
      return 'adaptive';
    }
  );
  const [baselineOverrides] = useState<{
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  }>(() => {
    const initial = initialExperience.cssVariables;
    if (initial && typeof (initial as { light?: unknown }).light === 'object') {
      return initial as {
        light: Record<string, ThemeOverrideValue>;
        dark: Record<string, ThemeOverrideValue>;
      };
    }
    if (initial && typeof initial === 'object' && !('light' in initial)) {
      return {
        light: initial as Record<string, ThemeOverrideValue>,
        dark: {},
      };
    }
    return { light: {}, dark: {} };
  });
  const [themeOverrides, setThemeOverrides] = useState<{
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  }>(() => {
    return {
      light: { ...baselineOverrides.light },
      dark: { ...baselineOverrides.dark },
    };
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<string | null>(null);
  const [writeApiKey, setWriteApiKey] = useState<string | null>(() => {
    return sessionStorage.getItem(`experiences.${config.experienceId}.key`);
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const panelRef = useRef<HTMLDivElement>(null);
  const picker = useElementPicker();

  const scheduleRun = useCallback((newExperience: ExperienceApiResponse) => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      window.AlgoliaExperiences?.run(withAutocompleteFocus(newExperience));
    }, 300);
  }, []);

  const handlePillClick = () => {
    if (writeApiKey) {
      setIsExpanded(true);
    } else {
      location.href = `${getDashboardBase(config.env || 'prod')}/apps/${config.appId}/experiences/${initialExperience.indexName}/authenticate/${config.experienceId}?previewUrl=${encodeURIComponent(location.href)}`;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      setWriteApiKey(token);
      sessionStorage.setItem(`experiences.${config.experienceId}.key`, token);
      setIsExpanded(true);

      params.delete('token');
      const query = params.toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', url);
    }
  }, [config.experienceId]);

  const onParameterChange = useCallback(
    (path: BlockPath, key: string, value: unknown) => {
      setExperience((prev) => {
        let updated = {
          ...prev,
          blocks: updateBlockAtPath(prev.blocks, path, (block) => {
            return {
              ...block,
              parameters: { ...block.parameters, [key]: value },
            };
          }),
        };

        // When an index name changes, sync the first item of child sortBy widgets
        // TODO: Widget-specific side effects like this shouldn't live in App.
        // Consider letting each widget type declare its own onParameterChange
        // hook, so App stays a generic orchestrator.
        if (key === 'indexName' && path.length === 1) {
          const parentBlock = updated.blocks[path[0]];
          if (parentBlock?.type === 'ais.index') {
            for (const [childIndex, child] of (
              parentBlock.children ?? []
            ).entries()) {
              if (child.type !== 'ais.sortBy') continue;
              const items = Array.isArray(child.parameters.items)
                ? (child.parameters.items as Array<Record<string, string>>)
                : [];
              if (items.length === 0) continue;
              updated = {
                ...updated,
                blocks: updateBlockAtPath(
                  updated.blocks,
                  [path[0], childIndex],
                  (block) => {
                    return {
                      ...block,
                      parameters: {
                        ...block.parameters,
                        items: items.map((item, idx) => {
                          return idx === 0
                            ? { ...item, value: value as string }
                            : item;
                        }),
                      },
                    };
                  }
                ),
              };
            }
          }
        }

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const onLocate = useCallback(
    (container: string, placement: string | undefined) => {
      let el: Element | null;
      try {
        el = document.querySelector(container);
      } catch {
        setToast(`Invalid selector "${container}".`);
        return;
      }

      if (!el) {
        setToast(`Container "${container}" not found on page.`);
        return;
      }

      if (placement === 'before' && el.previousElementSibling) {
        el = el.previousElementSibling;
      } else if (
        (placement === 'after' || placement === 'replace') &&
        el.nextElementSibling
      ) {
        el = el.nextElementSibling;
      }

      el.scrollIntoView({ behavior: 'instant', block: 'center' });

      requestAnimationFrame(() => {
        const candidate = el.firstChild instanceof Element ? el.firstChild : el;
        const rect = candidate.getBoundingClientRect();
        const target =
          rect.width === 0 || rect.height === 0
            ? el.getBoundingClientRect()
            : rect;

        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;top:${target.top}px;left:${target.left}px;width:${target.width}px;height:${target.height}px;border:2px solid #003dff;background:rgba(0,61,255,0.08);border-radius:4px;pointer-events:none;z-index:2147483646`;
        document.body.appendChild(overlay);

        const removeOverlay = () => {
          return overlay.remove();
        };
        const animation = overlay.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 1, offset: 0.75 },
            { opacity: 0, offset: 1 },
          ],
          { duration: 2000, easing: 'ease-out' }
        );
        animation.onfinish = removeOverlay;
        animation.oncancel = removeOverlay;
      });
    },
    []
  );

  const onDeleteBlock = useCallback(
    (path: BlockPath) => {
      setExperience((value) => {
        let blocks = deleteBlockAtPath(value.blocks, path);

        // Auto-remove empty index blocks after child deletion
        if (path.length === 2) {
          const parentIdx = path[0];
          const parent = blocks[parentIdx];
          if (
            parent?.type === 'ais.index' &&
            (parent.children?.length ?? 0) === 0
          ) {
            blocks = blocks.filter((_, idx) => {
              return idx !== parentIdx;
            });
          }
        }

        const updated = { ...value, blocks };

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const onAddBlock = useCallback(
    (type: string, targetParentIndex?: number): AddBlockResult => {
      const config = WIDGET_TYPES[type];
      const isIndexIndependent = config?.indexIndependent ?? false;

      // Compute path and indexCreated from the current state synchronously,
      // so the return value is always correct even in async contexts where
      // the setExperience updater may be batched.
      let result: AddBlockResult;

      setExperience((prev) => {
        const defaultParameters = Object.fromEntries(
          (config?.params ?? [])
            .filter((param) => {
              return 'default' in param;
            })
            .map((param) => {
              return [param.key, param.default];
            })
        );
        const newBlock: ExperienceApiBlock = {
          type,
          parameters: {
            ...(Object.keys(defaultParameters).length > 0
              ? defaultParameters
              : { container: '' }),
          },
        };

        // TODO: Same as onParameterChange — widget-specific logic to extract.
        // Pre-populate sortBy first item with parent index name
        if (type === 'ais.sortBy') {
          const parentIdx =
            targetParentIndex ??
            findLastIndex(prev.blocks, (bl) => {
              return bl.type === 'ais.index';
            });
          const parentIndexName =
            parentIdx >= 0
              ? (prev.blocks[parentIdx]?.parameters.indexName as string) || ''
              : '';
          if (parentIndexName && Array.isArray(newBlock.parameters.items)) {
            const items = newBlock.parameters.items as Array<
              Record<string, string>
            >;
            if (items.length > 0) {
              newBlock.parameters = {
                ...newBlock.parameters,
                items: items.map((item, idx) => {
                  return idx === 0 ? { ...item, value: parentIndexName } : item;
                }),
              };
            }
          }
        }

        let updated: ExperienceApiResponse;

        if (isIndexIndependent || type === 'ais.index') {
          result = { path: [prev.blocks.length], indexCreated: false };
          updated = { ...prev, blocks: [...prev.blocks, newBlock] };
        } else if (targetParentIndex !== undefined) {
          const childIdx =
            prev.blocks[targetParentIndex]?.children?.length ?? 0;
          result = {
            path: [targetParentIndex, childIdx],
            indexCreated: false,
          };
          updated = {
            ...prev,
            blocks: prev.blocks.map((block, i) => {
              return i === targetParentIndex
                ? { ...block, children: [...(block.children ?? []), newBlock] }
                : block;
            }),
          };
        } else {
          const lastIndexIdx = findLastIndex(prev.blocks, (bl) => {
            return bl.type === 'ais.index';
          });

          if (lastIndexIdx === -1) {
            result = {
              path: [prev.blocks.length, 0],
              indexCreated: true,
            };
            updated = {
              ...prev,
              blocks: [
                ...prev.blocks,
                {
                  type: 'ais.index',
                  parameters: { indexName: '', indexId: '' },
                  children: [newBlock],
                },
              ],
            };
          } else {
            const childIdx = prev.blocks[lastIndexIdx]?.children?.length ?? 0;
            result = {
              path: [lastIndexIdx, childIdx],
              indexCreated: false,
            };
            updated = {
              ...prev,
              blocks: prev.blocks.map((block, i) => {
                return i === lastIndexIdx
                  ? {
                      ...block,
                      children: [...(block.children ?? []), newBlock],
                    }
                  : block;
              }),
            };
          }
        }

        scheduleRun(updated);

        return updated;
      });

      setIsDirty(true);

      return result!;
    },
    [scheduleRun]
  );

  const onChangeWidgetIndex = useCallback(
    (widgetPath: BlockPath, targetIndexName: string) => {
      setExperience((prev) => {
        const updated = {
          ...prev,
          blocks: changeWidgetIndex(prev.blocks, widgetPath, targetIndexName),
        };

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const applyThemePreview = useCallback(
    (
      overrides: {
        light: Record<string, ThemeOverrideValue>;
        dark: Record<string, ThemeOverrideValue>;
      },
      modeConfig: 'adaptive' | 'fixed' = themeModeConfig
    ) => {
      const cssOverrides = modeConfig === 'fixed' ? overrides.light : overrides;
      const css = generateThemeCss(
        AUTOCOMPLETE_VARIABLES,
        cssOverrides,
        modeConfig
      );
      let style = document.querySelector(`style[${THEME_STYLE_ATTR}]`);
      if (!style) {
        style = document.createElement('style');
        style.setAttribute(THEME_STYLE_ATTR, '');
        document.head.appendChild(style);
      }
      style.textContent = css;
    },
    [themeModeConfig]
  );

  const onThemeVariableChange = useCallback(
    (key: string, value: ThemeOverrideValue) => {
      setThemeOverrides((prev) => {
        const updated = {
          ...prev,
          [themeMode]: { ...prev[themeMode], [key]: value },
        };
        applyThemePreview(updated);
        return updated;
      });
      setIsDirty(true);
    },
    [themeMode, applyThemePreview]
  );

  const onThemeVariableReset = useCallback(
    (key: string) => {
      setThemeOverrides((prev) => {
        const modeOverrides = { ...prev[themeMode] };
        const baselineValue = baselineOverrides[themeMode][key];
        if (baselineValue !== undefined) {
          modeOverrides[key] = baselineValue;
        } else {
          delete modeOverrides[key];
        }
        const updated = { ...prev, [themeMode]: modeOverrides };
        applyThemePreview(updated);
        return updated;
      });
      setIsDirty(true);
    },
    [themeMode, baselineOverrides, applyThemePreview]
  );

  const onThemeResetAll = useCallback(() => {
    const reset = {
      light: { ...baselineOverrides.light },
      dark: { ...baselineOverrides.dark },
    };
    setThemeOverrides(reset);
    applyThemePreview(reset);
    setIsDirty(true);
  }, [baselineOverrides, applyThemePreview]);

  const onThemeModeConfigChange = useCallback(
    (modeConfig: 'adaptive' | 'fixed') => {
      setThemeModeConfig(modeConfig);
      if (modeConfig === 'fixed') {
        // Switch back to light editing view and remove dark mode attrs
        setThemeMode('light');
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
      applyThemePreview(themeOverrides, modeConfig);
      setIsDirty(true);
    },
    [themeOverrides, applyThemePreview]
  );

  const onThemeModeChange = useCallback(
    (mode: 'light' | 'dark') => {
      setThemeMode(mode);
      if (mode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
      applyThemePreview(themeOverrides);
    },
    [themeOverrides, applyThemePreview]
  );

  const onPresetApply = useCallback(
    (preset: {
      overrides: {
        light: Record<string, ThemeOverrideValue>;
        dark: Record<string, ThemeOverrideValue>;
      };
    }) => {
      setThemeOverrides(preset.overrides);
      applyThemePreview(preset.overrides);
      setIsDirty(true);
    },
    [applyThemePreview]
  );

  const onSave = useCallback(async () => {
    setSaveState('saving');

    const cssVariables =
      themeModeConfig === 'fixed' ? themeOverrides.light : themeOverrides;
    const sanitized = sanitizeExperience({
      ...experience,
      cssVariables,
    });

    try {
      await saveExperience({
        appId: config.appId,
        apiKey: writeApiKey ?? config.apiKey,
        env: config.env ?? 'prod',
        config: sanitized,
      });

      setIsDirty(false);
      setSaveState('saved');
      setTimeout(() => {
        return setSaveState('idle');
      }, 2000);
    } catch (err) {
      setSaveState('idle');
      setToast(err instanceof Error ? err.message : 'Failed to save.');
    }
  }, [writeApiKey, config, experience, themeOverrides, themeModeConfig]);

  useEffect(() => {
    if (!panelRef.current) {
      return;
    }

    const currentPadding = getComputedStyle(document.body).paddingLeft;
    const panelWidth = panelRef.current.offsetWidth;

    const style = document.createElement('style');
    style.id = 'algolia-experiences-toolbar-styles';
    style.textContent = `
      .algolia-experiences-toolbar {
        padding-left: ${currentPadding};
        transition: padding-left 300ms ease-in-out;
      }
      .algolia-experiences-toolbar--open {
        padding-left: calc(${currentPadding} + ${panelWidth}px);
      }
      .algolia-experiences-toolbar--open .ais-AutocompleteDetachedOverlay {
        margin-left: calc(${currentPadding} + ${panelWidth}px);
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('algolia-experiences-toolbar');

    return () => {
      document.body.classList.remove(
        'algolia-experiences-toolbar',
        'algolia-experiences-toolbar--open'
      );
      style.remove();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      'algolia-experiences-toolbar--open',
      isExpanded
    );
  }, [isExpanded]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      return setToast(null);
    }, 4000);

    return () => {
      return clearTimeout(timer);
    };
  }, [toast]);

  return (
    <ToolbarProvider value={{ config, experience }}>
      <Panel
        panelRef={panelRef}
        experience={experience}
        dirty={isDirty}
        saveState={saveState}
        open={isExpanded}
        onClose={() => {
          return setIsExpanded(false);
        }}
        onSave={onSave}
        onParameterChange={onParameterChange}
        onLocate={onLocate}
        onDeleteBlock={onDeleteBlock}
        onAddBlock={onAddBlock}
        onChangeWidgetIndex={onChangeWidgetIndex}
        onPickElement={picker.startPicking}
        themeOverrides={themeOverrides}
        baselineOverrides={baselineOverrides}
        themeMode={themeMode}
        onThemeVariableChange={onThemeVariableChange}
        onThemeVariableReset={onThemeVariableReset}
        onThemeResetAll={onThemeResetAll}
        onThemeModeChange={onThemeModeChange}
        themeModeConfig={themeModeConfig}
        onThemeModeConfigChange={onThemeModeConfigChange}
        onPresetApply={onPresetApply}
      />
      <Pill
        visible={!isExpanded}
        locked={!writeApiKey}
        onClick={handlePillClick}
      />

      {toast && (
        <div
          role="alert"
          class="animate-[toast-in_200ms_ease-out] bg-background text-foreground fixed bottom-4 left-1/2 z-[2147483647] -translate-x-1/2 rounded-lg border px-4 py-2.5 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </ToolbarProvider>
  );
}
