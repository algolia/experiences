import { Plus, Trash2 } from 'lucide-preact';

import { Button } from '../ui/button';
import { Combobox, type Suggestion } from '../ui/combobox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type ItemsListFieldProps = {
  label: string;
  items: Array<Record<string, string>>;
  fields: Array<{
    key: string;
    label: string;
    placeholder?: string;
    inputType?: 'text' | 'number';
  }>;
  onItemsChange: (items: Array<Record<string, string>>) => void;
  lockedFirstValue?: string;
  fieldSuggestLists?: Record<string, Suggestion[]>;
};

export function ItemsListField({
  label,
  items,
  fields,
  onItemsChange,
  lockedFirstValue,
  fieldSuggestLists,
}: ItemsListFieldProps) {
  const isFirstLocked = Boolean(lockedFirstValue);

  return (
    <div class="space-y-1.5">
      <Label>{label}</Label>
      {items.length > 0 && (
        <div class="flex gap-1.5">
          <div class="flex min-w-0 flex-1 gap-1.5">
            {fields.map((field) => {
              return (
                <span
                  key={field.key}
                  class="min-w-0 flex-1 text-xs text-muted-foreground"
                >
                  {field.label}
                </span>
              );
            })}
          </div>
          <div class="w-9 shrink-0" />
        </div>
      )}
      {items.map((item, index) => {
        const isLocked = isFirstLocked && index === 0;

        return (
          <div key={index} class="flex items-start gap-1.5">
            <div class="flex min-w-0 flex-1 gap-1.5">
              {fields.map((field) => {
                const isValueLocked = isLocked && field.key === 'value';
                const suggestions = fieldSuggestLists?.[field.key];
                const fieldValue = isValueLocked
                  ? lockedFirstValue!
                  : (item[field.key] ?? '');

                function onFieldInput(newValue: string) {
                  const updated = items.map((existing, idx) => {
                    return idx === index
                      ? { ...existing, [field.key]: newValue }
                      : existing;
                  });
                  onItemsChange(updated);
                }

                return (
                  <div key={field.key} class="min-w-0 flex-1">
                    {suggestions && !isValueLocked ? (
                      <Combobox
                        placeholder={field.placeholder ?? field.label}
                        value={fieldValue}
                        suggestions={suggestions}
                        label={field.label}
                        onInput={onFieldInput}
                      />
                    ) : (
                      <Input
                        type={field.inputType ?? 'text'}
                        placeholder={field.placeholder ?? field.label}
                        value={fieldValue}
                        disabled={isValueLocked}
                        onInput={(event) => {
                          onFieldInput(
                            (event.target as HTMLInputElement).value
                          );
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {!isLocked && (
              <Button
                variant="ghost"
                size="icon"
                class="shrink-0"
                aria-label="Remove item"
                onClick={() => {
                  onItemsChange(
                    items.filter((_, idx) => {
                      return idx !== index;
                    })
                  );
                }}
              >
                <Trash2 class="size-4" />
              </Button>
            )}
          </div>
        );
      })}
      <Button
        variant="outline"
        size="sm"
        class="w-full"
        onClick={() => {
          const empty: Record<string, string> = {};
          for (const field of fields) {
            empty[field.key] = '';
          }
          onItemsChange([...items, empty]);
        }}
      >
        <Plus class="size-4" />
        Add item
      </Button>
    </div>
  );
}
