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

const HIDDEN_PARAMS = new Set(['cssVariables']);

export function BlockEditor({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
}: BlockEditorProps) {
  const editableParams = Object.entries(parameters).filter(
    ([key]) => !HIDDEN_PARAMS.has(key)
  );
  const widgetType = WIDGET_TYPES[type];
  const overrides = widgetType?.fieldOverrides ?? {};
  const paramLabels = widgetType?.paramLabels ?? {};

  return (
    <div class="space-y-3">
      {parameters.cssVariables &&
        Object.keys(parameters.cssVariables).length > 0 && (
          <div class="space-y-1.5">
            <p class="text-xs font-medium text-foreground">CSS Variables</p>
            <CssVariablesEditor
              variables={parameters.cssVariables}
              onChange={onCssVariableChange}
            />
          </div>
        )}

      {editableParams.map(([key, value]) => {
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
          case 'object':
            return (
              <ObjectField
                key={key}
                label={override.label}
                value={
                  typeof value === 'object' && value !== null
                    ? (value as Record<string, unknown>)
                    : {}
                }
                fields={override.fields}
                onChange={(subKey, subValue) =>
                  onParameterChange(key, {
                    ...(typeof value === 'object' && value !== null
                      ? value
                      : {}),
                    [subKey]: subValue,
                  })
                }
              />
            );
        }
      })}
    </div>
  );
}
