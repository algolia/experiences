import { useId } from 'preact/hooks';

import { Button } from '../ui/button';
import { CollapsibleContent } from '../ui/collapsible';
import { Combobox, type Suggestion } from '../ui/combobox';
import { InfoTooltip } from './info-tooltip';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type ListFieldProps = {
  label: string;
  description?: string;
  enabled: boolean;
  items: string[];
  placeholder?: string;
  required?: boolean;
  suggestions?: Suggestion[];
  onToggle: (value: string[] | undefined) => void;
  onItemsChange: (items: string[]) => void;
};

export function ListField({
  label,
  description,
  enabled,
  items,
  placeholder,
  required,
  suggestions = [],
  onToggle,
  onItemsChange,
}: ListFieldProps) {
  const id = useId();
  const isOpen = required || enabled;

  return (
    <div>
      <div class="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </Label>
        {!required && (
          <Switch
            id={id}
            checked={enabled}
            onCheckedChange={(checked) => {
              return onToggle(checked ? [] : undefined);
            }}
          />
        )}
      </div>
      <CollapsibleContent open={isOpen}>
        <div class="mt-2 space-y-1.5">
          {items.map((item, index) => {
            return (
              <div key={index} class="flex items-center gap-1.5">
                {suggestions.length > 0 ? (
                  <Combobox
                    value={item}
                    placeholder={placeholder}
                    onInput={(text) => {
                      const next = [...items];
                      next[index] = text;
                      onItemsChange(next);
                    }}
                    suggestions={suggestions}
                    label={`${label} item ${index + 1}`}
                  />
                ) : (
                  <Input
                    value={item}
                    placeholder={placeholder}
                    onInput={(event) => {
                      const next = [...items];
                      next[index] = (event.target as HTMLInputElement).value;
                      onItemsChange(next);
                    }}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  class="shrink-0 size-9"
                  aria-label="Remove item"
                  onClick={() => {
                    onItemsChange(
                      items.filter((_, i) => {
                        return i !== index;
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
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            class="w-full"
            onClick={() => {
              onItemsChange([...items, '']);
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
