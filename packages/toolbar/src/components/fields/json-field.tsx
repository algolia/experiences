import { useId, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';
import { parseJsonObject } from '../../utils/parse-json-object';
import { InfoTooltip } from './info-tooltip';
import { CollapsibleContent } from '../ui/collapsible';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

type JsonFieldProps = {
  label: string;
  description?: string;
  enabled?: boolean;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onToggle?: (toggled: boolean) => void;
};

export function JsonField({
  label,
  description,
  enabled,
  value,
  onChange,
  onToggle,
}: JsonFieldProps) {
  const id = useId();
  const [text, setText] = useState(() => {
    return JSON.stringify(value, null, 2);
  });
  const [error, setError] = useState<string | null>(null);

  function onInput(newText: string) {
    setText(newText);

    const result = parseJsonObject(newText);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setError(null);
    onChange(result.value);
  }

  const toggleable = onToggle !== undefined;

  return (
    <div class="group space-y-1">
      {toggleable ? (
        <div class="flex items-center justify-between">
          <Label htmlFor={id}>
            {label}
            {description && (
              <InfoTooltip content={description} class="mt-0.5" />
            )}
          </Label>
          <Switch
            id={id}
            checked={enabled ?? false}
            onCheckedChange={(checked) => {
              if (checked) {
                setText('{}');
                setError(null);
              }
              return onToggle(checked);
            }}
          />
        </div>
      ) : (
        <Label htmlFor={id}>
          {label}
          {description && <InfoTooltip content={description} class="mt-0.5" />}
        </Label>
      )}
      <CollapsibleContent open={toggleable ? (enabled ?? false) : true}>
        <textarea
          id={toggleable ? undefined : id}
          value={text}
          onInput={(event) => {
            return onInput((event.target as HTMLTextAreaElement).value);
          }}
          rows={6}
          class={cn(
            'placeholder:text-muted-foreground border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 font-mono text-xs shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'resize-y',
            error && 'border-red-500'
          )}
        />
      </CollapsibleContent>
      {error && <p class="text-xs text-red-500">{error}</p>}
    </div>
  );
}
