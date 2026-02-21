type TooltipPositionInput = {
  triggerRect: { left: number; top: number; width: number };
  tooltipWidth: number;
  tooltipHeight: number;
  hostRect: { left: number; right: number } | null;
};

type TooltipPosition = { top: number; left: number };

const GAP = 6;
const PADDING = 8;

export function computeTooltipPosition({
  triggerRect,
  tooltipWidth,
  tooltipHeight,
  hostRect,
}: TooltipPositionInput): TooltipPosition {
  const minLeft = (hostRect?.left ?? 0) + PADDING;
  const maxRight = (hostRect?.right ?? window.innerWidth) - PADDING;

  const idealLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
  const clampedLeft = Math.max(
    minLeft,
    Math.min(idealLeft, maxRight - tooltipWidth)
  );

  return {
    top: triggerRect.top - tooltipHeight - GAP,
    left: clampedLeft,
  };
}
