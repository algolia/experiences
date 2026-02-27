import { useId, useState } from 'preact/hooks';

import { useIndexAttributes } from '../../hooks/use-indices';
import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Combobox } from '../ui/combobox';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

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
                <SubField
                  key={field.key}
                  label={field.label}
                  value={typeof raw === 'string' ? raw : String(raw ?? '')}
                  onInput={(text) => {
                    return onFieldChange(field.key, text);
                  }}
                  suggestions={attributes}
                />
              );
            })}
            {priceField && (
              <div class="flex items-end gap-2">
                <div class="flex-1">
                  <SubField
                    label={priceField.label}
                    value={
                      typeof value.price === 'string'
                        ? value.price
                        : String(value.price ?? '')
                    }
                    onInput={(text) => {
                      return onFieldChange('price', text);
                    }}
                    suggestions={attributes}
                  />
                </div>
                {currencyField && (
                  <div class="w-16 shrink-0">
                    <SubField
                      label={currencyField.label}
                      value={
                        typeof value.currency === 'string'
                          ? value.currency
                          : String(value.currency ?? '')
                      }
                      onInput={(text) => {
                        return onFieldChange('currency', text);
                      }}
                      suggestions={[]}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </div>
  );
}

type SubFieldProps = {
  label: string;
  value: string;
  onInput: (value: string) => void;
  suggestions: string[];
};

function SubField({ label, value, onInput, suggestions }: SubFieldProps) {
  const id = useId();

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {suggestions.length > 0 ? (
        <Combobox
          id={id}
          value={value}
          onInput={onInput}
          suggestions={suggestions}
          label={label}
        />
      ) : (
        <Input
          id={id}
          value={value}
          onInput={(event) => {
            return onInput((event.target as HTMLInputElement).value);
          }}
        />
      )}
    </div>
  );
}
