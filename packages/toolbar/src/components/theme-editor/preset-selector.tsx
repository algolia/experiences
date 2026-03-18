import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';

import type { ThemeOverrideValue, ThemePreset } from '@experiences/theme';
import { AUTOCOMPLETE_PRESETS } from '@experiences/theme/autocomplete-presets';

import { Check, ChevronDown } from 'lucide-preact';

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activePresetName = useMemo(() => {
    return findMatchingPreset(themeOverrides);
  }, [themeOverrides]);

  const currentSwatches = useMemo(() => {
    return getSwatchColors(themeOverrides[themeMode], themeMode);
  }, [themeOverrides, themeMode]);

  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1);
    }
  }, [open]);

  const scrollHighlightedIntoView = useCallback((index: number) => {
    const list = listRef.current;
    if (!list) return;
    const items = list.children;
    if (index >= 0 && index < items.length) {
      (items[index] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;

      const count = AUTOCOMPLETE_PRESETS.length;

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const next = highlightedIndex < count - 1 ? highlightedIndex + 1 : 0;
          setHighlightedIndex(next);
          scrollHighlightedIntoView(next);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const prev = highlightedIndex > 0 ? highlightedIndex - 1 : count - 1;
          setHighlightedIndex(prev);
          scrollHighlightedIntoView(prev);
          break;
        }
        case 'Enter': {
          event.preventDefault();
          const preset = AUTOCOMPLETE_PRESETS[highlightedIndex];
          if (preset) {
            onPresetApply(preset);
          }
          break;
        }
        case 'Escape': {
          event.preventDefault();
          setOpen(false);
          break;
        }
      }
    },
    [open, highlightedIndex, onPresetApply, scrollHighlightedIntoView]
  );

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
    <div class="relative" ref={containerRef} onKeyDown={handleKeyDown}>
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
        <ChevronDown
          class="size-4 text-muted-foreground transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div
          ref={listRef}
          class="absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg"
        >
          {AUTOCOMPLETE_PRESETS.map((preset, presetIndex) => {
            const swatches = getSwatchColors(
              preset.overrides[themeMode],
              themeMode
            );
            const isActive = activePresetName === preset.name;
            const isHighlighted = presetIndex === highlightedIndex;

            return (
              <button
                key={preset.name}
                type="button"
                class={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent ${
                  isHighlighted ? 'bg-accent' : isActive ? 'bg-accent/50' : ''
                }`}
                onMouseEnter={() => {
                  setHighlightedIndex(presetIndex);
                }}
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
                {isActive && <Check class="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
