import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

import { saveExperience } from '../api';
import { useElementPicker } from '../hooks/use-element-picker';
import type {
  Environment,
  ExperienceApiResponse,
  ToolbarConfig,
} from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { Panel } from './panel';
import { Pill } from './pill';

type AppProps = {
  config: ToolbarConfig;
  initialExperience: ExperienceApiResponse;
};

type SaveState = 'idle' | 'saving' | 'saved';

const DASHBOARD_BASE: Record<Environment, string> = {
  beta: 'https://beta-dashboard.algolia.com',
  prod: 'https://dashboard.algolia.com',
};

export function App({ config, initialExperience }: AppProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [experience, setExperience] = useState(initialExperience);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [adminApiKey, setAdminApiKey] = useState<string | null>(() => {
    return sessionStorage.getItem(`experiences.${config.experienceId}.key`);
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const picker = useElementPicker();

  const scheduleRun = useCallback((newExperience: ExperienceApiResponse) => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      window.AlgoliaExperiences?.run(newExperience);
    }, 300);
  }, []);

  const updateCssVariablesOnPage = useCallback(
    (blockIndex: number, key: string, value: string) => {
      const existingStyle = document.querySelector(
        'style[data-algolia-experiences-toolbar]'
      );
      const style = existingStyle ?? document.createElement('style');

      if (!existingStyle) {
        style.setAttribute('data-algolia-experiences-toolbar', '');
        document.head.appendChild(style);
      }

      const allVars: Record<string, string> = {};

      experience.blocks.forEach((block, blockIdx) => {
        const vars = block.parameters.cssVariables ?? {};

        Object.entries(vars).forEach(([varName, varValue]) => {
          if (blockIdx === blockIndex && varName === key) {
            allVars[`--ais-${varName}`] = value;
          } else {
            allVars[`--ais-${varName}`] = varValue;
          }
        });
      });

      style.textContent = `:root { ${Object.entries(allVars)
        .map(([prop, val]) => {
          return `${prop}: ${val}`;
        })
        .join('; ')} }`;
    },
    [experience]
  );

  const onPillClick = () => {
    if (adminApiKey) {
      setIsExpanded(true);
    } else {
      location.href = `${DASHBOARD_BASE[config.env || 'prod']}/apps/${config.appId}/experiences/${initialExperience.indexName}/authenticate/${config.experienceId}?previewUrl=${encodeURIComponent(location.href)}`;
    }
  };

  const onParameterChange = useCallback(
    (index: number, key: string, value: unknown) => {
      setExperience((prev) => {
        const updated = {
          ...prev,
          blocks: prev.blocks.map((block, blockIdx) => {
            return blockIdx === index
              ? {
                  ...block,
                  parameters: { ...block.parameters, [key]: value },
                }
              : block;
          }),
        };

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const onCssVariableChange = useCallback(
    (index: number, key: string, value: string) => {
      updateCssVariablesOnPage(index, key, value);

      setExperience((prev) => {
        return {
          ...prev,
          blocks: prev.blocks.map((block, blockIdx) => {
            return blockIdx === index
              ? {
                  ...block,
                  parameters: {
                    ...block.parameters,
                    cssVariables: {
                      ...block.parameters.cssVariables,
                      [key]: value,
                    },
                  },
                }
              : block;
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
    (index: number) => {
      setExperience((value) => {
        const updated = {
          ...value,
          blocks: value.blocks.filter((_, i) => {
            return i !== index;
          }),
        };

        scheduleRun(updated);

        return updated;
      });
      setIsDirty(true);
    },
    [scheduleRun]
  );

  const onAddBlock = useCallback(
    (type: string) => {
      setExperience((value) => {
        const updated = {
          ...value,
          blocks: [
            ...value.blocks,
            {
              type,
              parameters: {
                ...(WIDGET_TYPES[type]?.defaultParameters ?? {
                  container: '',
                }),
              },
            },
          ],
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

    try {
      await saveExperience({
        appId: config.appId,
        apiKey: adminApiKey ?? config.apiKey,
        env: config.env ?? 'prod',
        config: experience,
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
  }, [adminApiKey, config, experience]);

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

  useEffect(() => {
    const url = new URL(window.location.href);
    const algoliaExperiencesKey = url.searchParams.get('algoliaExperiencesKey');

    if (algoliaExperiencesKey) {
      setAdminApiKey(algoliaExperiencesKey);
      sessionStorage.setItem(
        `experiences.${config.experienceId}.key`,
        algoliaExperiencesKey
      );
      setIsExpanded(true);

      url.searchParams.delete('algoliaExperiencesKey');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <>
      <Panel
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
        onPickElement={picker.startPicking}
      />
      <Pill visible={!isExpanded} locked={!adminApiKey} onClick={onPillClick} />

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
