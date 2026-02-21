import type { ExperienceApiBlockParameters, Placement } from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { CssVariablesEditor } from './fields/css-variables-editor';
import { JsonField } from './fields/json-field';
import { ObjectField } from './fields/object-field';
import { PlacementField } from './fields/placement-field';
import { SwitchField } from './fields/switch-field';
import { TextField } from './fields/text-field';

type BlockEditorProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
};

export function BlockEditor({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
  onPickElement,
}: BlockEditorProps) {
  const widgetType = WIDGET_TYPES[type];
  const overrides = widgetType?.fieldOverrides ?? {};
  const paramLabels = widgetType?.paramLabels ?? {};

  const paramKeys = widgetType?.fieldOrder
    ? widgetType.fieldOrder.filter((key) => {
        return key in parameters;
      })
    : Object.keys(parameters);

  return (
    <div class="space-y-3">
      {paramKeys.map((key) => {
        if (key === 'placement') {
          return null;
        }

        if (key === 'cssVariables') {
          const vars = parameters.cssVariables;
          if (!vars || Object.keys(vars).length === 0) return null;
          return (
            <div key={key} class="space-y-1.5">
              <p class="text-xs font-medium text-foreground">CSS Variables</p>
              <CssVariablesEditor
                variables={vars}
                onChange={onCssVariableChange}
              />
            </div>
          );
        }

        if (key === 'container') {
          return (
            <PlacementField
              key={key}
              container={
                typeof parameters.container === 'string'
                  ? parameters.container
                  : ''
              }
              placement={parameters.placement as Placement | undefined}
              onContainerChange={(selector) => {
                return onParameterChange('container', selector);
              }}
              onPlacementChange={(placement) => {
                return onParameterChange('placement', placement);
              }}
              onPickElement={onPickElement}
            />
          );
        }

        const value = parameters[key];
        const override = overrides[key];

        if (!override) {
          return (
            <TextField
              key={key}
              label={paramLabels[key] ?? key}
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onInput={(text) => {
                return onParameterChange(key, text);
              }}
            />
          );
        }

        switch (override.type) {
          case 'switch':
            return (
              <SwitchField
                key={key}
                label={override.label}
                checked={Boolean(value)}
                onToggle={(checked) => {
                  return onParameterChange(key, checked);
                }}
              />
            );
          case 'json':
            return (
              <JsonField
                key={key}
                label={override.label}
                value={
                  typeof value === 'object' && value !== null
                    ? (value as Record<string, unknown>)
                    : {}
                }
                onChange={(newValue) => {
                  return onParameterChange(key, newValue);
                }}
              />
            );
          case 'object': {
            const enabled = typeof value === 'object' && value !== null;
            const objectValue = enabled
              ? (value as Record<string, unknown>)
              : {};
            return (
              <ObjectField
                key={key}
                label={override.label}
                enabled={enabled}
                value={objectValue}
                defaultValue={override.defaultValue}
                fields={override.fields}
                onToggle={(toggled) => {
                  return onParameterChange(key, toggled);
                }}
                onFieldChange={(subKey, subValue) => {
                  return onParameterChange(key, {
                    ...objectValue,
                    [subKey]: subValue,
                  });
                }}
              />
            );
          }
        }
      })}
    </div>
  );
}
