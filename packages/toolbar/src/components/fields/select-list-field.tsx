import { useId } from 'preact/hooks';

import { Plus, Trash2 } from 'lucide-preact';

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
                  <Trash2 class="size-4" />
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
            <Plus class="size-4" />
            Add
          </Button>
        </div>
      </CollapsibleContent>
    </div>
  );
}
