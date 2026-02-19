import type { ComponentChildren, JSX } from 'preact';

import { cn } from '../../lib/utils';

/**
 * Lightweight Collapsible without Radix dependency.
 * Radix Collapsible relies on React internals that are incompatible with
 * preact/compat, so we use a simple open/closed pattern instead.
 */

type CollapsibleProps = JSX.IntrinsicElements['div'] & {
  open: boolean;
};

function Collapsible({
  open,
  children,
  class: className,
  ...props
}: CollapsibleProps) {
  return (
    <div
      data-slot="collapsible"
      data-state={open ? 'open' : 'closed'}
      class={className}
      {...props}
    >
      {children}
    </div>
  );
}

type CollapsibleTriggerProps = JSX.IntrinsicElements['button'];

function CollapsibleTrigger({
  class: className,
  'aria-expanded': ariaExpanded,
  ...props
}: CollapsibleTriggerProps) {
  return (
    <button
      data-slot="collapsible-trigger"
      class={cn('flex w-full items-center', className)}
      type="button"
      aria-expanded={ariaExpanded}
      {...props}
    />
  );
}

type CollapsibleContentProps = {
  open: boolean;
  children: ComponentChildren;
  class?: string;
};

function CollapsibleContent({
  open,
  children,
  class: className,
}: CollapsibleContentProps) {
  return (
    <div
      data-slot="collapsible-content"
      data-state={open ? 'open' : 'closed'}
      class={cn(
        'grid transition-[grid-template-rows] duration-200 ease-in-out',
        className
      )}
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div class="overflow-hidden">{children}</div>
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
