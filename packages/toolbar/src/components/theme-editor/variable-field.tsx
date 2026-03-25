import { ChevronDown, RotateCcw } from 'lucide-preact';

import type { ThemeOverrideValue, ThemeVariable } from '@experiences/theme';
import { isShadowLayers } from '@experiences/theme';

import { rgbTripletToHex, hexToRgbTriplet } from '../../utils/css-colors';
import { InfoTooltip } from '../fields/info-tooltip';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { SliderField } from '../fields/slider-field';
import { ShadowField } from '../fields/shadow-field';

function displayLabel(variable: ThemeVariable) {
  return variable.shortLabel ?? variable.label;
}

function ResetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      class="text-muted-foreground hover:text-foreground hover:bg-muted ml-1 shrink-0 rounded-sm p-0.5 transition-colors"
      aria-label={`Reset ${label}`}
      title="Reset to default"
    >
      <RotateCcw class="size-3.5" />
    </button>
  );
}

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
    <ResetButton label={variable.label} onClick={onReset} />
  ) : null;

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Label>{displayLabel(variable)}</Label>
          <InfoTooltip content={variable.description} />
        </div>
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
      {variable.type === 'select' && variable.constraints?.options && (
        <ThemeSelectField
          value={String(value)}
          options={variable.constraints.options}
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
    </div>
  );
}

type ColorAlphaFieldProps = {
  colorVariable: ThemeVariable;
  colorValue: ThemeOverrideValue;
  isColorOverridden: boolean;
  onColorChange: (value: ThemeOverrideValue) => void;
  onColorReset: () => void;
  alphaVariable: ThemeVariable;
  alphaValue: ThemeOverrideValue;
  isAlphaOverridden: boolean;
  onAlphaChange: (value: ThemeOverrideValue) => void;
  onAlphaReset: () => void;
};

export function ColorAlphaField({
  colorVariable,
  colorValue,
  isColorOverridden,
  onColorChange,
  onColorReset,
  alphaVariable,
  alphaValue,
  isAlphaOverridden,
  onAlphaChange,
  onAlphaReset,
}: ColorAlphaFieldProps) {
  const hexValue = rgbTripletToHex(String(colorValue));

  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <Label>{displayLabel(colorVariable)}</Label>
          <InfoTooltip content={colorVariable.description} />
        </div>
        <div class="flex items-center gap-1">
          {isAlphaOverridden && (
            <ResetButton label={alphaVariable.label} onClick={onAlphaReset} />
          )}
          {isColorOverridden && (
            <ResetButton label={colorVariable.label} onClick={onColorReset} />
          )}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="color"
          value={hexValue}
          onInput={(event) => {
            return onColorChange(
              hexToRgbTriplet((event.target as HTMLInputElement).value)
            );
          }}
          class="size-8 shrink-0 cursor-pointer rounded border border-input p-0.5"
        />
        <Input
          value={String(colorValue)}
          onInput={(event) => {
            return onColorChange((event.target as HTMLInputElement).value);
          }}
          class="w-28 shrink-0 font-mono text-xs"
        />
        <input
          type="range"
          min={alphaVariable.constraints?.min ?? 0}
          max={alphaVariable.constraints?.max ?? 1}
          step={alphaVariable.constraints?.step ?? 0.01}
          value={Number(alphaValue)}
          onInput={(event) => {
            return onAlphaChange(
              Number((event.target as HTMLInputElement).value)
            );
          }}
          class="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        />
        <Input
          type="number"
          min={alphaVariable.constraints?.min ?? 0}
          max={alphaVariable.constraints?.max ?? 1}
          step={alphaVariable.constraints?.step ?? 0.01}
          value={Number(alphaValue)}
          onInput={(event) => {
            return onAlphaChange(
              Number((event.target as HTMLInputElement).value)
            );
          }}
          class="w-18 shrink-0 text-xs font-mono"
        />
      </div>
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

type ThemeSelectFieldProps = {
  value: string;
  options: string[];
  onInput: (value: string) => void;
};

function ThemeSelectField({ value, options, onInput }: ThemeSelectFieldProps) {
  return (
    <div class="relative">
      <select
        value={value}
        onChange={(event) => {
          return onInput((event.target as HTMLSelectElement).value);
        }}
        class="h-8 w-full appearance-none rounded-md border border-input bg-background px-2 pr-7 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        {options.map((option) => {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        })}
      </select>
      <ChevronDown class="text-muted-foreground pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2" />
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
