import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

import type { ThemeOverrideValue, ThemePreset } from '@experiences/theme';
import { AUTOCOMPLETE_PRESETS } from '@experiences/theme/autocomplete-presets';

import type { ThemeMode } from './constants';
import { findMatchingPreset, getSwatchColors } from './constants';

type PresetSelectorProps = {
  themeOverrides: {
    light: Record<string, ThemeOverrideValue>;
    dark: Record<string, ThemeOverrideValue>;
  };
  themeMode: ThemeMode;
  onPresetApply: (preset: ThemePreset) => void;
};

export function PresetSelector({
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
    if (!open) {
      return;
    }

    const root = containerRef.current?.getRootNode() as
      | ShadowRoot
      | Document
      | undefined;
    if (!root) {
      return;
    }

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
