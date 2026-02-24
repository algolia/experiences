import { useId } from 'preact/hooks';

import { Button } from '../ui/button';
import { CollapsibleContent } from '../ui/collapsible';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { InfoTooltip } from './info-tooltip';

type SelectListFieldProps = {
  label: string;
  description?: string;
  enabled: boolean;
  items: string[];
  options: Array<{ value: string; label: string }>;
  onToggle: (value: string[] | undefined) => void;
  onItemsChange: (items: string[]) => void;
};

export function SelectListField({
  label,
  description,
  enabled,
  items,
  options,
  onToggle,
  onItemsChange,
}: SelectListFieldProps) {
  const id = useId();

  const usedValues = new Set(items);
  const availableOptions = options.filter((opt) => {
    return !usedValues.has(opt.value);
  });

  return (
    <div>
      <div class="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </Label>
        <Switch
          id={id}
          checked={enabled}
          onCheckedChange={(checked) => {
            return onToggle(checked ? [options[0]!.value] : undefined);
          }}
        />
      </div>
      <CollapsibleContent open={enabled}>
        <div class="mt-2 space-y-1.5">
          {items.map((item, index) => {
            return (
              <div key={item} class="flex items-center gap-1.5">
                <select
                  class="bg-background border-input h-9 flex-1 appearance-none rounded-md border px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={item}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = (event.target as HTMLSelectElement).value;
                    onItemsChange(next);
                  }}
                >
                  {options.map((opt) => {
                    const isCurrentOrAvailable =
                      opt.value === item || !usedValues.has(opt.value);

                    return (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={!isCurrentOrAvailable}
                      >
                        {opt.label}
                      </option>
                    );
                  })}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  class="shrink-0 size-9"
                  aria-label="Remove item"
                  onClick={() => {
                    const next = items.filter((_, idx) => {
                      return idx !== index;
                    });
                    if (next.length === 0) {
                      onToggle(undefined);
                    } else {
                      onItemsChange(next);
                    }
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
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            class="w-full"
            disabled={availableOptions.length === 0}
            onClick={() => {
              onItemsChange([...items, availableOptions[0]!.value]);
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
            Add
          </Button>
        </div>
      </CollapsibleContent>
    </div>
  );
}
