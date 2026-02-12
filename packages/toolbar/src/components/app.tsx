import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { saveExperience } from '../api';
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

  const handleSave = useCallback(async () => {
    try {
      await saveExperience({
        appId: config.appId,
        apiKey: config.apiKey,
        experienceId: config.experienceId,
        env: config.env ?? 'prod',
        config: experience,
      });
      setDirty(false);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to save.');
    }
  }, [config, experience]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <Panel
        experience={experience}
        dirty={dirty}
        open={expanded}
        onClose={() => setExpanded(false)}
        onSave={handleSave}
        onParameterChange={handleParameterChange}
        onCssVariableChange={handleCssVariableChange}
      />
      <Pill visible={!expanded} onClick={() => setExpanded(true)} />

      {toast && (
        <div class="animate-[toast-in_200ms_ease-out] bg-background text-foreground fixed bottom-4 left-1/2 z-[2147483647] -translate-x-1/2 rounded-lg border px-4 py-2.5 text-sm shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
