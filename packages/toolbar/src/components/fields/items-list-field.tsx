import { Button } from '../ui/button';
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
};

export function ItemsListField({
  label,
  items,
  fields,
  onItemsChange,
  lockedFirstValue,
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

                return (
                  <div key={field.key} class="min-w-0 flex-1">
                    <Input
                      type={field.inputType ?? 'text'}
                      placeholder={field.placeholder ?? field.label}
                      value={
                        isValueLocked
                          ? lockedFirstValue!
                          : (item[field.key] ?? '')
                      }
                      disabled={isValueLocked}
                      onInput={(event) => {
                        const updated = items.map((existing, idx) => {
                          return idx === index
                            ? {
                                ...existing,
                                [field.key]: (event.target as HTMLInputElement)
                                  .value,
                              }
                            : existing;
                        });
                        onItemsChange(updated);
                      }}
                    />
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
                <svg
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
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
        <svg
          class="size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add item
      </Button>
    </div>
  );
}
