import { useState } from 'preact/hooks';

import { getAutocompleteVariables, groupByCategory } from '../theme-variables';
import type { ThemeVariable } from '../theme-variables';
import {
  hexToRgbTriplet,
  isRgbTriplet,
  rgbTripletToHex,
} from '../utils/css-colors';
import { ColorField } from './fields/color-field';
import { SliderField } from './fields/slider-field';
import { TextField } from './fields/text-field';

const LIGHT_PRESET: Record<string, string> = {
  'primary-color-rgb': '30, 89, 255',
  'text-color-rgb': '38, 38, 38',
  'muted-color-rgb': '82, 82, 82',
  'button-text-color-rgb': '255, 255, 255',
  'border-color-rgb': '150, 150, 150',
  'background-color-rgb': '255, 255, 255',
  'autocomplete-input-focus-color-rgb': '30, 89, 255',
  'autocomplete-search-icon-color-rgb': '30, 89, 255',
  'autocomplete-item-selected-color-rgb': '30, 89, 255',
  'autocomplete-header-color-rgb': '30, 89, 255',
};

const DARK_PRESET: Record<string, string> = {
  'primary-color-rgb': '110, 160, 255',
  'text-color-rgb': '255, 255, 255',
  'muted-color-rgb': '190, 190, 190',
  'button-text-color-rgb': '255, 255, 255',
  'border-color-rgb': '100, 100, 100',
  'background-color-rgb': '38, 38, 38',
  'autocomplete-input-focus-color-rgb': '110, 160, 255',
  'autocomplete-search-icon-color-rgb': '110, 160, 255',
  'autocomplete-item-selected-color-rgb': '110, 160, 255',
  'autocomplete-header-color-rgb': '110, 160, 255',
};

type ThemeEditorProps = {
  cssVariables: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

function isDarkMode(cssVariables: Record<string, string>): boolean {
  return (
    cssVariables['background-color-rgb'] === DARK_PRESET['background-color-rgb']
  );
}

function ThemeField({
  variable,
  value,
  onChange,
}: {
  variable: ThemeVariable;
  value: string;
  onChange: (key: string, value: string) => void;
}) {
  if (variable.type === 'color') {
    const displayValue = isRgbTriplet(value) ? rgbTripletToHex(value) : value;
    const defaultDisplay = isRgbTriplet(variable.default)
      ? rgbTripletToHex(variable.default)
      : variable.default;

    return (
      <ColorField
        label={variable.label}
        value={displayValue || defaultDisplay}
        onInput={(color) => {
          return onChange(
            variable.key,
            isRgbTriplet(variable.default) ? hexToRgbTriplet(color) : color
          );
        }}
      />
    );
  }

  if (variable.slider) {
    const { min, max, step, unit } = variable.slider;
    const parsed = parseFloat(value);
    const numericValue = Number.isNaN(parsed)
      ? parseFloat(variable.default)
      : parsed;

    return (
      <SliderField
        label={variable.label}
        value={numericValue}
        min={min}
        max={max}
        step={step}
        unit={unit}
        onInput={(numValue) => {
          return onChange(variable.key, `${numValue}${unit}`);
        }}
      />
    );
  }

  return (
    <TextField
      label={variable.label}
      value={value}
      placeholder={variable.default}
      onInput={(text) => {
        return onChange(variable.key, text);
      }}
    />
  );
}

function ThemeSection({
  title,
  variables,
  cssVariables,
  onChange,
  defaultOpen,
}: {
  title: string;
  variables: ThemeVariable[];
  cssVariables: Record<string, string>;
  onChange: (key: string, value: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const groups = groupByCategory(variables);

  return (
    <div class="border-b last:border-b-0">
      <button
        type="button"
        class="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
        onClick={() => {
          return setOpen(!open);
        }}
        aria-expanded={open}
      >
        {title}
        <svg
          class={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        class="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div class={open ? 'overflow-visible' : 'overflow-hidden'}>
          <div class="space-y-4 px-4 pb-4">
            {groups.map((group) => {
              return (
                <div key={group.category}>
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    {group.category}
                  </p>
                  <div class="space-y-2">
                    {group.variables.map((variable) => {
                      return (
                        <ThemeField
                          key={variable.key}
                          variable={variable}
                          value={cssVariables[variable.key] ?? ''}
                          onChange={onChange}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const PROMPT_SUGGESTIONS = [
  'Minimal Ghibli vibes',
  'Monochrome manga-inspired',
  'Soft pastel candy shop',
  'Bold brutalist design',
];

function ThemeAgentInput() {
  const [prompt, setPrompt] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  return (
    <div class="px-4 pt-4 pb-3 border-b space-y-2.5">
      <div class="relative">
        <textarea
          class="w-full resize-none rounded-lg border bg-background px-3 py-2 pr-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          rows={2}
          placeholder="Describe the look and feel you want..."
          value={prompt}
          onInput={(event) => {
            setPrompt((event.target as HTMLTextAreaElement).value);
            setSelectedSuggestion(null);
          }}
        />
        <button
          type="button"
          class="absolute right-2 bottom-2 rounded-md bg-primary p-1 text-primary-foreground opacity-50 cursor-not-allowed"
          disabled
          aria-label="Generate theme"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m5 12 7-7 7 7M12 19V5" />
          </svg>
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        {PROMPT_SUGGESTIONS.map((suggestion) => {
          return (
            <button
              key={suggestion}
              type="button"
              class={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${selectedSuggestion === suggestion ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
              onClick={() => {
                setPrompt(suggestion);
                setSelectedSuggestion(suggestion);
              }}
            >
              {suggestion}
            </button>
          );
        })}
      </div>
      <p class="text-[10px] text-muted-foreground/60 text-center">
        AI theme generation coming soon
      </p>
    </div>
  );
}

function ColorModeToggle({
  cssVariables,
  onChange,
}: {
  cssVariables: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const dark = isDarkMode(cssVariables);

  const applyPreset = (preset: Record<string, string>) => {
    for (const [key, value] of Object.entries(preset)) {
      onChange(key, value);
    }
  };

  return (
    <div class="flex items-center gap-2 px-4 py-3 border-b">
      <span class="text-sm font-medium">Color mode</span>
      <div class="ml-auto flex rounded-md border text-xs">
        <button
          type="button"
          class={`px-2.5 py-1 rounded-l-md transition-colors ${!dark ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
          onClick={() => {
            return applyPreset(LIGHT_PRESET);
          }}
        >
          {/* Sun icon */}
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
          class={`px-2.5 py-1 rounded-r-md transition-colors ${dark ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}
          onClick={() => {
            return applyPreset(DARK_PRESET);
          }}
        >
          {/* Moon icon */}
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
    </div>
  );
}

export function ThemeEditor({ cssVariables, onChange }: ThemeEditorProps) {
  const autocompleteVariables = getAutocompleteVariables();

  return (
    <div>
      <ThemeAgentInput />
      <ColorModeToggle cssVariables={cssVariables} onChange={onChange} />
      <ThemeSection
        title="Autocomplete"
        variables={autocompleteVariables}
        cssVariables={cssVariables}
        onChange={onChange}
        defaultOpen={true}
      />
    </div>
  );
}
