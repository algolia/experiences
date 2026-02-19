import type { JSX } from 'preact';
import { cn } from '../../lib/utils';

type InputProps = JSX.IntrinsicElements['input'];

function Input({ class: className, ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      class={cn(
        'placeholder:text-muted-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        className
      )}
      {...props}
    />
  );
}

export { Input };
