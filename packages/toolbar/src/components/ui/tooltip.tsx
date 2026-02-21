import type { ComponentChildren } from 'preact';
import { useCallback, useId, useRef, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';
import { computeTooltipPosition } from '../../utils/compute-tooltip-position';

type TooltipProps = {
  content: ComponentChildren;
  children: ComponentChildren;
  class?: string;
};

type Position = { top: number; left: number };

function Tooltip({ content, children, class: className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    // Use the Shadow DOM host as the boundary for clamping. Falls back to
    // the viewport width if rendered outside a Shadow DOM (e.g., in tests).
    const root = trigger.getRootNode();
    const host = root instanceof ShadowRoot ? (root.host as HTMLElement) : null;
    const hostRect = host?.getBoundingClientRect() ?? null;
    const triggerRect = trigger.getBoundingClientRect();

    setPosition(
      computeTooltipPosition({
        triggerRect,
        tooltipWidth: tooltip.offsetWidth,
        tooltipHeight: tooltip.offsetHeight,
        hostRect,
      })
    );
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(reposition);
  }, [reposition]);

  const hide = useCallback(() => {
    setOpen(false);
    setPosition(null);
  }, []);

  return (
    <span class={cn('inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        class="inline-flex cursor-help"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={open ? id : undefined}
      >
        {children}
      </button>
      {open && (
        <span
          id={id}
          ref={tooltipRef}
          role="tooltip"
          class="bg-background text-foreground border-border fixed z-50 w-max max-w-56 rounded-md border px-2.5 py-1.5 text-xs shadow-md"
          style={
            position
              ? { top: `${position.top}px`, left: `${position.left}px` }
              : { visibility: 'hidden' }
          }
        >
          {content}
        </span>
      )}
    </span>
  );
}

export { Tooltip };
