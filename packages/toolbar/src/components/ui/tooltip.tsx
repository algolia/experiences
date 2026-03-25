import type { ComponentChildren } from 'preact';
import { useEffect, useId, useRef, useState } from 'preact/hooks';

import { cn } from '../../lib/utils';

type TooltipProps = {
  content: ComponentChildren;
  children: ComponentChildren;
  class?: string;
};

function findBoundary(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current) {
    const pos = getComputedStyle(current).position;
    if (pos === 'fixed' || pos === 'absolute') return current;
    current = current.parentElement;
  }
  return null;
}

function Tooltip({ content, children, class: className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const boundaryRef = useRef<HTMLElement | null>(null);

  function reposition() {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    if (!boundaryRef.current) {
      boundaryRef.current = findBoundary(trigger);
    }

    const boundaryRect = boundaryRef.current?.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;

    const gap = 6;
    const padding = 8;
    const minTop = (boundaryRect?.top ?? 0) + padding;
    const maxBottom = (boundaryRect?.bottom ?? window.innerHeight) - padding;

    // Position to the right of the trigger, vertically centered
    const left = triggerRect.right + gap;
    const top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;

    // Clamp vertically within boundary
    const clampedTop = Math.max(
      minTop,
      Math.min(top, maxBottom - tooltipHeight)
    );

    tooltip.style.top = `${clampedTop}px`;
    tooltip.style.left = `${left}px`;
  }

  // Hide tooltip when the nearest scrollable ancestor scrolls
  useEffect(() => {
    if (!open || !triggerRef.current) return;

    let scrollable: HTMLElement | null = triggerRef.current.parentElement;
    while (scrollable) {
      if (getComputedStyle(scrollable).overflowY === 'auto') break;
      scrollable = scrollable.parentElement;
    }
    if (!scrollable) return;

    const onScroll = () => {
      setOpen(false);
    };
    scrollable.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollable.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  function show() {
    setOpen(true);
    requestAnimationFrame(reposition);
  }

  function hide() {
    setOpen(false);
  }

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
          class="bg-background text-foreground border-border fixed z-50 w-max max-w-56 rounded-md border px-2.5 py-1.5 text-xs font-normal shadow-md"
        >
          {content}
        </span>
      )}
    </span>
  );
}

export { Tooltip };
