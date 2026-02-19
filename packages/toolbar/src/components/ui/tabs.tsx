import type { JSX } from 'preact';
import { cn } from '../../lib/utils';

type DivProps = JSX.IntrinsicElements['div'];
type ButtonProps = JSX.IntrinsicElements['button'];

function TabsList({ class: className, ...props }: DivProps) {
  return (
    <div
      data-slot="tabs-list"
      class={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-full items-center justify-center rounded-lg p-1',
        className
      )}
      role="tablist"
      {...props}
    />
  );
}

function TabsTrigger({
  class: className,
  active,
  ...props
}: ButtonProps & { active?: boolean }) {
  return (
    <button
      data-slot="tabs-trigger"
      type="button"
      role="tab"
      aria-selected={active}
      class={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:text-foreground/80',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  class: className,
  active,
  ...props
}: DivProps & { active?: boolean }) {
  if (!active) return null;

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      class={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { TabsList, TabsTrigger, TabsContent };
