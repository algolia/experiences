import type { JSX } from 'preact';
import { cn } from '../../lib/utils';

type LabelProps = JSX.IntrinsicElements['label'];

function Label({ class: className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      class={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-has-disabled:cursor-not-allowed group-has-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Label };
