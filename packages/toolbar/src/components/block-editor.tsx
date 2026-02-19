import type { ExperienceApiBlockParameters } from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { CssVariablesEditor } from './fields/css-variables-editor';
import { ObjectField } from './fields/object-field';
import { SwitchField } from './fields/switch-field';
import { TextField } from './fields/text-field';

type BlockEditorProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
};

export function BlockEditor({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
}: BlockEditorProps) {
  const widgetType = WIDGET_TYPES[type];
  const overrides = widgetType?.fieldOverrides ?? {};
  const paramLabels = widgetType?.paramLabels ?? {};

  const paramKeys = widgetType?.fieldOrder
    ? widgetType.fieldOrder.filter((key) => key in parameters)
    : Object.keys(parameters);

  return (
    <div class="space-y-3">
      {paramKeys.map((key) => {
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

        const value = parameters[key];
        const override = overrides[key];

        if (!override) {
          return (
            <TextField
              key={key}
              label={paramLabels[key] ?? key}
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onInput={(v) => onParameterChange(key, v)}
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
                onToggle={(v) => onParameterChange(key, v)}
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
                onToggle={(v) => onParameterChange(key, v)}
                onFieldChange={(subKey, subValue) =>
                  onParameterChange(key, {
                    ...objectValue,
                    [subKey]: subValue,
                  })
                }
              />
            );
          }
        }
      })}
    </div>
  );
}
