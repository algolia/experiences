import type { ExperienceApiBlockParameters } from '../types';
import { CssVariablesEditor } from './fields/css-variables-editor';
import { TextField } from './fields/text-field';

type BlockEditorProps = {
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
};

const HIDDEN_PARAMS = new Set(['container', 'cssVariables']);

export function BlockEditor({
  parameters,
  onParameterChange,
  onCssVariableChange,
}: BlockEditorProps) {
  const editableParams = Object.entries(parameters).filter(
    ([key]) => !HIDDEN_PARAMS.has(key)
  );

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

      {editableParams.map(([key, value]) => (
        <TextField
          key={key}
          label={key}
          value={typeof value === 'string' ? value : JSON.stringify(value)}
          onInput={(v) => onParameterChange(key, v)}
        />
      ))}
    </div>
  );
}
