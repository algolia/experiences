import type { ExperienceApiBlockParameters, Placement } from '../types';
import type { IndexSuggestKind } from '../widget-types';
import { WIDGET_TYPES } from '../widget-types';
import type { SuggestLists } from './panel';
import type { Suggestion } from './ui/combobox';
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
import { RecentConfigField } from './fields/recent-config-field';
import { SuggestionsConfigField } from './fields/suggestions-config-field';
import { ToggleableTextField } from './fields/toggleable-text-field';

type BlockEditorProps = {
  type: string;
  parameters: ExperienceApiBlockParameters;
  onParameterChange: (key: string, value: unknown) => void;
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
  onPickElement,
  parentIndexName,
  suggestLists,
}: BlockEditorProps) {
  const widgetType = WIDGET_TYPES[type];
  const params = widgetType?.params ?? [];
  const visibleParams = params.filter((param) => {
    return !param.hidden && (param.key in parameters || param.field);
  });

  const columns = widgetType?.columns;

  return (
    <div
      class={columns ? 'grid gap-3' : 'space-y-3'}
      style={
        columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined
      }
    >
      {visibleParams.map((param) => {
        const key = param.key;
        const field = param.field;
        const label = param.label ?? param.key;
        const description = param.description;

        if (key === 'placement') {
          return null;
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

        if (param.visibleIf) {
          const { key: depKey, value: depValue } = param.visibleIf;
          if (parameters[depKey] !== depValue) {
            return null;
          }
        }

        if (!field) {
          return (
            <TextField
              key={key}
              label={label}
              description={description}
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onInput={(text) => {
                return onParameterChange(key, text);
              }}
            />
          );
        }

        switch (field.type) {
          case 'switch':
            return (
              <SwitchField
                key={key}
                label={label}
                description={description}
                checked={Boolean(value)}
                onToggle={(checked) => {
                  onParameterChange(key, checked);
                  if (!checked) {
                    for (const dep of params) {
                      if (dep.visibleIf?.key === key) {
                        onParameterChange(dep.key, undefined);
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
                label={label}
                value={typeof value === 'string' ? value : undefined}
                options={field.options}
                defaultValue={field.defaultValue}
                onChange={(selected) => {
                  return onParameterChange(key, selected);
                }}
              />
            );
          case 'facet-value':
            return (
              <FacetValueField
                key={key}
                label={label}
                placeholder={field.placeholder}
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
                label={label}
                description={description}
                placeholder={field.placeholder}
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
            if (field.picker) {
              return (
                <TextPickerField
                  key={key}
                  label={label}
                  value={typeof value === 'string' ? value : ''}
                  placeholder={field.placeholder}
                  onInput={onTextInput}
                  onPickElement={onPickElement}
                />
              );
            }
            return (
              <TextField
                key={key}
                label={label}
                description={description}
                value={typeof value === 'string' ? value : ''}
                placeholder={field.placeholder}
                onInput={onTextInput}
                suggestions={
                  field.suggest ? suggestLists?.[field.suggest] : undefined
                }
              />
            );
          }
          case 'toggleable-text':
            return (
              <ToggleableTextField
                key={key}
                label={label}
                enabled={value !== false}
                value={typeof value === 'string' ? value : ''}
                placeholder={field.placeholder}
                picker={field.picker}
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
            const jsonToggleable = 'disabledValue' in field;

            return (
              <JsonField
                key={key}
                label={label}
                description={description}
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
                          toggled ? {} : field.disabledValue
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
                label={label}
                items={items}
                fields={field.fields}
                lockedFirstValue={
                  type === 'ais.sortBy' ? parentIndexName : undefined
                }
                onItemsChange={(newItems) => {
                  return onParameterChange(key, newItems);
                }}
                fieldSuggestLists={buildFieldSuggestLists(
                  field.fields,
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
                label={label}
                description={description}
                enabled={enabled}
                items={items}
                placeholder={field.placeholder}
                required={field.required}
                suggestions={
                  field.suggest ? suggestLists?.[field.suggest] : undefined
                }
                onToggle={(toggled) => {
                  onParameterChange(key, toggled);
                  if (toggled && field.excludes) {
                    onParameterChange(field.excludes, undefined);
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
                label={label}
                description={description}
                enabled={selectListEnabled}
                items={selectListItems}
                options={field.options}
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
                label={label}
                description={description}
                value={templateValue}
                fields={field.fields}
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
          case 'recent-config': {
            return (
              <RecentConfigField
                key={key}
                label={label}
                description={description}
                value={
                  typeof value === 'object' && value !== null
                    ? (value as Record<string, unknown>)
                    : Boolean(value)
                }
                onChange={(newValue) => {
                  return onParameterChange(key, newValue);
                }}
              />
            );
          }
          case 'suggestions-config': {
            return (
              <SuggestionsConfigField
                key={key}
                label={label}
                description={description}
                value={
                  typeof value === 'object' && value !== null
                    ? (value as Record<string, unknown>)
                    : false
                }
                onChange={(newValue) => {
                  return onParameterChange(key, newValue);
                }}
                suggestLists={suggestLists}
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
                label={label}
                description={description}
                enabled={enabled}
                value={objectValue}
                defaultValue={field.defaultValue}
                disabledValue={
                  'disabledValue' in field ? field.disabledValue : false
                }
                fields={field.fields}
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
                  field.fields,
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
