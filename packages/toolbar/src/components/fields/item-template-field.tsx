import { useId, useState } from 'preact/hooks';

import { useIndexAttributes } from '../../hooks/use-index-attributes';
import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { TextField } from './text-field';

type ItemTemplateFieldProps = {
  label: string;
  description?: string;
  value: Record<string, unknown>;
  fields: Array<{ key: string; label: string }>;
  onFieldChange: (key: string, value: string) => void;
  indexName?: string;
};

export function ItemTemplateField({
  label,
  description,
  value,
  fields,
  onFieldChange,
  indexName,
}: ItemTemplateFieldProps) {
  const [open, setOpen] = useState(true);
  const datalistId = useId();
  const attributes = useIndexAttributes(indexName);

  const priceField = fields.find((field) => {
    return field.key === 'price';
  });
  const currencyField = fields.find((field) => {
    return field.key === 'currency';
  });
  const regularFields = fields.filter((field) => {
    return field.key !== 'price' && field.key !== 'currency';
  });

  const listId = attributes.length > 0 ? datalistId : undefined;

  return (
    <div>
      <CollapsibleTrigger
        class="w-full justify-between"
        onClick={() => {
          return setOpen(!open);
        }}
        aria-expanded={open}
      >
        <span class="flex items-center gap-2 text-sm leading-none font-medium select-none">
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </span>
        <svg
          class={`size-3.5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent open={open}>
        <div class="pr-1 pb-1">
          <div class="border-l-2 border-border mt-1.5 space-y-2 pl-3">
            {regularFields.map((field) => {
              const raw = value[field.key];

              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={typeof raw === 'string' ? raw : String(raw ?? '')}
                  onInput={(text) => {
                    return onFieldChange(field.key, text);
                  }}
                  list={listId}
                />
              );
            })}
            {priceField && (
              <div class="flex items-end gap-2">
                <div class="flex-1">
                  <TextField
                    label={priceField.label}
                    value={
                      typeof value.price === 'string'
                        ? value.price
                        : String(value.price ?? '')
                    }
                    onInput={(text) => {
                      return onFieldChange('price', text);
                    }}
                    list={listId}
                  />
                </div>
                {currencyField && (
                  <div class="w-16 shrink-0">
                    <TextField
                      label={currencyField.label}
                      value={
                        typeof value.currency === 'string'
                          ? value.currency
                          : String(value.currency ?? '')
                      }
                      onInput={(text) => {
                        return onFieldChange('currency', text);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {listId && (
            <datalist id={listId}>
              {attributes.map((attr) => {
                return <option key={attr} value={attr} />;
              })}
            </datalist>
          )}
        </div>
      </CollapsibleContent>
    </div>
  );
}
