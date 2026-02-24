import type { ExperienceApiBlockParameters, Placement } from '../types';
import { WIDGET_TYPES } from '../widget-types';
import { CssVariablesEditor } from './fields/css-variables-editor';
import { FacetValueField } from './fields/facet-value-field';
import { JsonField } from './fields/json-field';
import { ListField } from './fields/list-field';
import { NumberField } from './fields/number-field';
import { ObjectField } from './fields/object-field';
import { PlacementField } from './fields/placement-field';
import { SelectField } from './fields/select-field';
import { SwitchField } from './fields/switch-field';
import { TextField } from './fields/text-field';
import { TextPickerField } from './fields/text-picker-field';
import { ItemsListField } from './fields/items-list-field';
import { ToggleableTextField } from './fields/toggleable-text-field';

type BlockEditorProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
  parentIndexName?: string;
};

export function BlockEditor({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
  onPickElement,
  parentIndexName,
}: BlockEditorProps) {
  const widgetType = WIDGET_TYPES[type];
  const overrides = widgetType?.fieldOverrides ?? {};
  const paramLabels = widgetType?.paramLabels ?? {};
  const paramDescriptions = widgetType?.paramDescriptions ?? {};

  const columns = widgetType?.columns;

  const paramKeys = widgetType?.fieldOrder
    ? widgetType.fieldOrder.filter((key) => {
        return key in parameters || key in overrides;
      })
    : Object.keys(parameters);

  return (
    <div
      class={columns ? 'grid gap-3' : 'space-y-3'}
      style={
        columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined
      }
    >
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

        if (override?.visibleIf) {
          const { key: depKey, value: depValue } = override.visibleIf;
          if (parameters[depKey] !== depValue) {
            return null;
          }
        }

        if (!override) {
          return (
            <TextField
              key={key}
              label={paramLabels[key] ?? key}
              description={paramDescriptions[key]}
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
                description={paramDescriptions[key]}
                checked={Boolean(value)}
                onToggle={(checked) => {
                  onParameterChange(key, checked);
                  if (!checked) {
                    for (const [depKey, depOverride] of Object.entries(
                      overrides
                    )) {
                      if (depOverride.visibleIf?.key === key) {
                        onParameterChange(depKey, undefined);
                      }
                    }
                  }
                }}
              />
            );
          case 'select':
            return (
              <SelectField
                key={key}
                label={override.label}
                value={typeof value === 'string' ? value : undefined}
                options={override.options}
                defaultValue={override.defaultValue}
                onChange={(selected) => {
                  return onParameterChange(key, selected);
                }}
              />
            );
          case 'facet-value':
            return (
              <FacetValueField
                key={key}
                label={override.label}
                placeholder={override.placeholder}
                value={
                  typeof value === 'string' ||
                  typeof value === 'number' ||
                  typeof value === 'boolean'
                    ? value
                    : undefined
                }
                onChange={(parsed) => {
                  return onParameterChange(key, parsed);
                }}
              />
            );
          case 'number':
            return (
              <NumberField
                key={key}
                label={override.label}
                placeholder={override.placeholder}
                value={typeof value === 'number' ? String(value) : ''}
                onInput={(text) => {
                  return onParameterChange(
                    key,
                    text === '' ? undefined : Number(text)
                  );
                }}
              />
            );
          case 'text': {
            const onTextInput = (text: string) => {
              return onParameterChange(key, text === '' ? undefined : text);
            };
            if (override.picker) {
              return (
                <TextPickerField
                  key={key}
                  label={override.label}
                  value={typeof value === 'string' ? value : ''}
                  placeholder={override.placeholder}
                  onInput={onTextInput}
                  onPickElement={onPickElement}
                />
              );
            }
            return (
              <TextField
                key={key}
                label={override.label}
                value={typeof value === 'string' ? value : ''}
                placeholder={override.placeholder}
                onInput={onTextInput}
              />
            );
          }
          case 'toggleable-text':
            return (
              <ToggleableTextField
                key={key}
                label={override.label}
                enabled={value !== false}
                value={typeof value === 'string' ? value : ''}
                placeholder={override.placeholder}
                picker={override.picker}
                onToggle={(toggled) => {
                  return onParameterChange(key, toggled);
                }}
                onInput={(text) => {
                  return onParameterChange(key, text);
                }}
                onPickElement={onPickElement}
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
          case 'items-list': {
            const items = Array.isArray(value)
              ? (value as Array<Record<string, string>>)
              : [];
            return (
              <ItemsListField
                key={key}
                label={override.label}
                items={items}
                fields={override.fields}
                lockedFirstValue={
                  type === 'ais.sortBy' ? parentIndexName : undefined
                }
                onItemsChange={(newItems) => {
                  return onParameterChange(key, newItems);
                }}
              />
            );
          }
          case 'list': {
            const enabled = Array.isArray(value);
            const items = enabled ? (value as string[]) : [];
            return (
              <ListField
                key={key}
                label={override.label}
                enabled={enabled}
                items={items}
                placeholder={override.placeholder}
                onToggle={(toggled) => {
                  onParameterChange(key, toggled);
                  if (toggled && override.excludes) {
                    onParameterChange(override.excludes, undefined);
                  }
                }}
                onItemsChange={(newItems) => {
                  return onParameterChange(key, newItems);
                }}
              />
            );
          }
          case 'object': {
            const enabled = typeof value === 'object' && value !== null;
            const objectValue = enabled
              ? (value as Record<string, unknown>)
              : {};
            return (
              <ObjectField
                key={key}
                label={override.label}
                description={paramDescriptions[key]}
                enabled={enabled}
                value={objectValue}
                defaultValue={override.defaultValue}
                disabledValue={
                  'disabledValue' in override ? override.disabledValue : false
                }
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
