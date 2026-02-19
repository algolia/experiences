import type { JSX } from 'preact';
import { cn } from '../../lib/utils';

type DivProps = JSX.IntrinsicElements['div'];

function Card({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="card"
      class={cn(
        'bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="card-header"
      class={cn('flex items-center gap-2 px-6', className)}
      {...props}
    />
  );
}

function CardContent({ class: className, ...props }: DivProps) {
  return (
    <div data-slot="card-content" class={cn('px-6', className)} {...props} />
  );
}

export { Card, CardHeader, CardContent };
