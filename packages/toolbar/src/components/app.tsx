import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { checkApiKeyAcl, saveExperience } from '../api';
import type { ExperienceApiResponse, ToolbarConfig } from '../types';
import { Panel } from './panel';
import { Pill } from './pill';

type AppProps = {
  config: ToolbarConfig;
  initialExperience: ExperienceApiResponse;
};

export function App({ config, initialExperience }: AppProps) {
  const [expanded, setExpanded] = useState(false);
  const [experience, setExperience] =
    useState<ExperienceApiResponse>(initialExperience);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [adminApiKey, setAdminApiKey] = useState<string | null>(null);
  const [needsAdminKey, setNeedsAdminKey] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const scheduleRun = useCallback(
    (updatedExperience: ExperienceApiResponse) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        window.AlgoliaExperiences?.run(updatedExperience);
      }, 300);
    },
    []
  );

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

      // Collect all css variables from all blocks
      const allVars: Record<string, string> = {};
      experience.blocks.forEach((block, i) => {
        const vars = block.parameters.cssVariables ?? {};
        Object.entries(vars).forEach(([k, v]) => {
          if (i === blockIndex && k === key) {
            allVars[`--ais-${k}`] = value;
          } else {
            allVars[`--ais-${k}`] = v;
          }
        });
      });

      style.textContent = `:root { ${Object.entries(allVars)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')} }`;
    },
    [experience]
  );

  const handleParameterChange = useCallback(
    (blockIndex: number, key: string, value: unknown) => {
      setExperience((prev) => {
        const updated = {
          ...prev,
          blocks: prev.blocks.map((block, i) =>
            i === blockIndex
              ? {
                  ...block,
                  parameters: { ...block.parameters, [key]: value },
                }
              : block
          ),
        };
        scheduleRun(updated);
        return updated;
      });
      setDirty(true);
    },
    [scheduleRun]
  );

  const handleCssVariableChange = useCallback(
    (blockIndex: number, key: string, value: string) => {
      updateCssVariablesOnPage(blockIndex, key, value);

      setExperience((prev) => ({
        ...prev,
        blocks: prev.blocks.map((block, i) =>
          i === blockIndex
            ? {
                ...block,
                parameters: {
                  ...block.parameters,
                  cssVariables: {
                    ...(block.parameters.cssVariables ?? {}),
                    [key]: value,
                  },
                },
              }
            : block
        ),
      }));
      setDirty(true);
    },
    [updateCssVariablesOnPage]
  );

  const onLocate = useCallback((container: string) => {
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

      const removeOverlay = () => overlay.remove();
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
  }, []);

  const doSave = useCallback(
    async (apiKey: string) => {
      await saveExperience({
        appId: config.appId,
        apiKey,
        experienceId: config.experienceId,
        env: config.env ?? 'prod',
        config: experience,
      });
      setDirty(false);
    },
    [config, experience]
  );

  const handleSave = useCallback(async () => {
    try {
      if (adminApiKey) {
        await doSave(adminApiKey);
        return;
      }
      const hasAcl = await checkApiKeyAcl(
        config.appId,
        config.apiKey,
        'editSettings'
      );
      if (hasAcl) {
        setAdminApiKey(config.apiKey);
        await doSave(config.apiKey);
      } else {
        setNeedsAdminKey(true);
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to save.');
    }
  }, [config, adminApiKey, doSave]);

  const handleAdminKeySave = useCallback(
    async (key: string) => {
      try {
        setAdminApiKey(key);
        setNeedsAdminKey(false);
        await doSave(key);
      } catch (error) {
        setToast(error instanceof Error ? error.message : 'Failed to save.');
      }
    },
    [doSave]
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <Panel
        appId={config.appId}
        experience={experience}
        dirty={dirty}
        open={expanded}
        needsAdminKey={needsAdminKey}
        onClose={() => setExpanded(false)}
        onSave={handleSave}
        onAdminKeySave={handleAdminKeySave}
        onParameterChange={handleParameterChange}
        onCssVariableChange={handleCssVariableChange}
        onLocate={onLocate}
      />
      <Pill visible={!expanded} onClick={() => setExpanded(true)} />

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
