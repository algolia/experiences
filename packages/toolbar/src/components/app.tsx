import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { saveExperience } from '../api';
import { useElementPicker } from '../hooks/use-element-picker';
import { sanitizeExperience } from '../lib/utils';
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

const DASHBOARD_BASE: Record<Environment, string> = {
  beta: 'https://beta-dashboard.algolia.com',
  prod: 'https://dashboard.algolia.com',
};

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
          blocks: (block.blocks ?? []).map((child, ci) => {
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
          blocks: (block.blocks ?? []).filter((_, ci) => {
            return ci !== childIdx;
          }),
        }
      : block;
  });
}

export function App({ config, initialExperience }: AppProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [experience, setExperience] = useState(initialExperience);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
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
      window.AlgoliaExperiences?.run(newExperience);
    }, 300);
  }, []);

  const updateCssVariablesOnPage = useCallback(
    (
      blocks: ExperienceApiBlock[],
      path: BlockPath,
      key: string,
      value: string
    ) => {
      const existingStyle = document.querySelector(
        'style[data-algolia-experiences-toolbar]'
      );
      const style = existingStyle ?? document.createElement('style');

      if (!existingStyle) {
        style.setAttribute('data-algolia-experiences-toolbar', '');
        document.head.appendChild(style);
      }

      const allVars: Record<string, string> = {};

      const collectVars = (items: ExperienceApiBlock[], parentIdx?: number) => {
        items.forEach((block, i) => {
          const currentPath: BlockPath =
            parentIdx !== undefined ? [parentIdx, i] : [i];
          const vars = block.parameters.cssVariables ?? {};
          const isTarget =
            currentPath.length === path.length &&
            currentPath.every((val, idx) => {
              return val === path[idx];
            });

          Object.entries(vars).forEach(([varName, varValue]) => {
            if (isTarget && varName === key) {
              allVars[`--ais-${varName}`] = value;
            } else {
              allVars[`--ais-${varName}`] = varValue;
            }
          });

          if (block.blocks) {
            collectVars(block.blocks, i);
          }
        });
      };

      collectVars(blocks);

      style.textContent = `:root { ${Object.entries(allVars)
        .map(([prop, val]) => {
          return `${prop}: ${val}`;
        })
        .join('; ')} }`;
    },
    []
  );

  const handlePillClick = () => {
    if (writeApiKey) {
      setIsExpanded(true);
    } else {
      location.href = `${DASHBOARD_BASE[config.env || 'prod']}/apps/${config.appId}/experiences/${initialExperience.indexName}/authenticate/${config.experienceId}?previewUrl=${encodeURIComponent(location.href)}`;
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
              parentBlock.blocks ?? []
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

  const onCssVariableChange = useCallback(
    (path: BlockPath, key: string, value: string) => {
      setExperience((prev) => {
        updateCssVariablesOnPage(prev.blocks, path, key, value);

        return {
          ...prev,
          blocks: updateBlockAtPath(prev.blocks, path, (block) => {
            return {
              ...block,
              parameters: {
                ...block.parameters,
                cssVariables: {
                  ...block.parameters.cssVariables,
                  [key]: value,
                },
              },
            };
          }),
        };
      });

      setIsDirty(true);
    },
    [updateCssVariablesOnPage]
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
        const updated = {
          ...value,
          blocks: deleteBlockAtPath(value.blocks, path),
        };

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
        const newBlock: ExperienceApiBlock = {
          type,
          parameters: {
            ...(config?.defaultParameters ?? { container: '' }),
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
          const childIdx = prev.blocks[targetParentIndex]?.blocks?.length ?? 0;
          result = {
            path: [targetParentIndex, childIdx],
            indexCreated: false,
          };
          updated = {
            ...prev,
            blocks: prev.blocks.map((block, i) => {
              return i === targetParentIndex
                ? { ...block, blocks: [...(block.blocks ?? []), newBlock] }
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
                  blocks: [newBlock],
                },
              ],
            };
          } else {
            const childIdx = prev.blocks[lastIndexIdx]?.blocks?.length ?? 0;
            result = {
              path: [lastIndexIdx, childIdx],
              indexCreated: false,
            };
            updated = {
              ...prev,
              blocks: prev.blocks.map((block, i) => {
                return i === lastIndexIdx
                  ? { ...block, blocks: [...(block.blocks ?? []), newBlock] }
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

  const onMoveBlock = useCallback(
    (fromPath: BlockPath, toParentIndex: number) => {
      setExperience((prev) => {
        if (fromPath.length !== 2) return prev;
        const [srcParent, srcChild] = fromPath;
        if (srcParent === toParentIndex) return prev;

        const block = prev.blocks[srcParent]?.blocks?.[srcChild];
        if (!block) return prev;

        const withRemoved = deleteBlockAtPath(prev.blocks, fromPath);
        const updated = {
          ...prev,
          blocks: withRemoved.map((bl, idx) => {
            return idx === toParentIndex
              ? { ...bl, blocks: [...(bl.blocks ?? []), block] }
              : bl;
          }),
        };

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const onSave = useCallback(async () => {
    setSaveState('saving');

    const sanitized = sanitizeExperience(experience);

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
  }, [writeApiKey, config, experience]);

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
    <>
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
        onCssVariableChange={onCssVariableChange}
        onLocate={onLocate}
        onDeleteBlock={onDeleteBlock}
        onAddBlock={onAddBlock}
        onMoveBlock={onMoveBlock}
        onPickElement={picker.startPicking}
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
    </>
  );
}
