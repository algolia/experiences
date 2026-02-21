import type { ComponentChildren } from 'preact';
import { useCallback, useId, useRef, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';

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
    const hostRect = host?.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    const gap = 6;
    const padding = 8;
    const minLeft = (hostRect?.left ?? 0) + padding;
    const maxRight = (hostRect?.right ?? window.innerWidth) - padding;

    // Center horizontally on trigger, clamp within host
    const idealLeft =
      triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    const clampedLeft = Math.max(
      minLeft,
      Math.min(idealLeft, maxRight - tooltipWidth)
    );

    setPosition({
      top: triggerRect.top - tooltipHeight - gap,
      left: clampedLeft,
    });
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
