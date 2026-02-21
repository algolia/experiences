import { useId, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';
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

    try {
      const parsed = JSON.parse(newText);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setError('Must be a JSON object');
        return;
      }
      setError(null);
      onChange(parsed);
    } catch {
      setError('Invalid JSON');
    }
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
