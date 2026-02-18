import type { JSX } from 'preact';
import { cn } from '../../lib/utils';

type SpinnerProps = Omit<JSX.IntrinsicElements['svg'], 'children'>;

function Spinner({ class: className, ...props }: SpinnerProps) {
  return (
    <svg
      class={cn('size-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="2"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
}

export { Spinner };
