import type { ExperienceApiBlockParameters, Placement } from '../types';
import type { IndexSuggestKind } from '../widget-types';
import { WIDGET_TYPES } from '../widget-types';
import type { SuggestLists } from './panel';
import type { Suggestion } from './ui/combobox';
import { CssVariablesEditor } from './fields/css-variables-editor';
import { FacetValueField } from './fields/facet-value-field';
import { JsonField } from './fields/json-field';
import { ListField } from './fields/list-field';
import { NumberField } from './fields/number-field';
import { ObjectField } from './fields/object-field';
import { PlacementField } from './fields/placement-field';
import { SelectField } from './fields/select-field';
import { SelectListField } from './fields/select-list-field';
import { SwitchField } from './fields/switch-field';
import { TextField } from './fields/text-field';
import { TextPickerField } from './fields/text-picker-field';
import { ItemsListField } from './fields/items-list-field';
import { ItemTemplateField } from './fields/item-template-field';
import { ToggleableTextField } from './fields/toggleable-text-field';

type BlockEditorProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
  onCssVariableChange: (key: string, value: string) => void;
  onPickElement: (callback: (selector: string) => void) => void;
  parentIndexName?: string;
  suggestLists?: SuggestLists;
};

function buildFieldSuggestLists(
  fields: Array<{ key: string; suggest?: IndexSuggestKind }>,
  suggestLists: SuggestLists | undefined
): Record<string, Suggestion[]> | undefined {
  if (!suggestLists) {
    return undefined;
  }

  const lists: Record<string, Suggestion[]> = {};
  let hasAny = false;

  for (const field of fields) {
    if (field.suggest) {
      const suggestions = suggestLists[field.suggest];

      if (suggestions && suggestions.length > 0) {
        lists[field.key] = suggestions;
        hasAny = true;
      }
    }
  }

  return hasAny ? lists : undefined;
}

export function BlockEditor({
  type,
  parameters,
  onParameterChange,
  onCssVariableChange,
  onPickElement,
  parentIndexName,
  suggestLists,
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
                description={paramDescriptions[key]}
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
                description={paramDescriptions[key]}
                value={typeof value === 'string' ? value : ''}
                placeholder={override.placeholder}
                onInput={onTextInput}
                suggestions={
                  override.suggest
                    ? suggestLists?.[override.suggest]
                    : undefined
                }
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
          case 'json': {
            const jsonEnabled = typeof value === 'object' && value !== null;
            const jsonValue = jsonEnabled
              ? (value as Record<string, unknown>)
              : {};
            const jsonToggleable = 'disabledValue' in override;

            return (
              <JsonField
                key={key}
                label={override.label}
                description={paramDescriptions[key]}
                enabled={jsonToggleable ? jsonEnabled : undefined}
                value={jsonValue}
                onChange={(newValue) => {
                  return onParameterChange(key, newValue);
                }}
                onToggle={
                  jsonToggleable
                    ? (toggled) => {
                        return onParameterChange(
                          key,
                          toggled ? {} : override.disabledValue
                        );
                      }
                    : undefined
                }
              />
            );
          }
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
                fieldSuggestLists={buildFieldSuggestLists(
                  override.fields,
                  suggestLists
                )}
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
                description={paramDescriptions[key]}
                enabled={enabled}
                items={items}
                placeholder={override.placeholder}
                required={override.required}
                suggestions={
                  override.suggest
                    ? suggestLists?.[override.suggest]
                    : undefined
                }
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
          case 'select-list': {
            const selectListEnabled = Array.isArray(value);
            const selectListItems = selectListEnabled
              ? (value as string[])
              : [];
            return (
              <SelectListField
                key={key}
                label={override.label}
                description={paramDescriptions[key]}
                enabled={selectListEnabled}
                items={selectListItems}
                options={override.options}
                onToggle={(toggled) => {
                  return onParameterChange(key, toggled);
                }}
                onItemsChange={(newItems) => {
                  return onParameterChange(key, newItems);
                }}
              />
            );
          }
          case 'item-template': {
            const templateValue =
              typeof value === 'object' && value !== null
                ? (value as Record<string, unknown>)
                : {};
            return (
              <ItemTemplateField
                key={key}
                label={override.label}
                description={paramDescriptions[key]}
                value={templateValue}
                fields={override.fields}
                onFieldChange={(subKey, subValue) => {
                  return onParameterChange(key, {
                    ...templateValue,
                    [subKey]: subValue,
                  });
                }}
                indexName={parentIndexName}
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
                fieldSuggestLists={buildFieldSuggestLists(
                  override.fields,
                  suggestLists
                )}
              />
            );
          }
        }
      })}
    </div>
  );
}
