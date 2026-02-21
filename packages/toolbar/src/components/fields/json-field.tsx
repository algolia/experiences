import { useId, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';
import { parseJsonObject } from '../../utils/parse-json-object';
import { Label } from '../ui/label';

type JsonFieldProps = {
  label: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

export function JsonField({ label, value, onChange }: JsonFieldProps) {
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

  return (
    <div class="group space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
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
      {error && <p class="text-xs text-red-500">{error}</p>}
    </div>
  );
}
