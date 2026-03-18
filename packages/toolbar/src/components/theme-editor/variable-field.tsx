import { RotateCcw } from 'lucide-preact';

import type { ThemeOverrideValue, ThemeVariable } from '@experiences/theme';
import { isShadowLayers } from '@experiences/theme';

import { rgbTripletToHex, hexToRgbTriplet } from '../../utils/css-colors';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SliderField } from '../fields/slider-field';
import { ShadowField } from '../fields/shadow-field';

type VariableFieldProps = {
  variable: ThemeVariable;
  value: ThemeOverrideValue;
  isOverridden: boolean;
  onChange: (value: ThemeOverrideValue) => void;
  onReset: () => void;
};

export function VariableField({
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
      <RotateCcw class="size-3.5" />
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
