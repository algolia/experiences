import { describe, expect, it } from 'vitest';

import { computeTooltipPosition } from '../src/utils/compute-tooltip-position';

describe('computeTooltipPosition', () => {
  it('centers the tooltip horizontally on the trigger', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 200, top: 100, width: 20 },
      tooltipWidth: 100,
      tooltipHeight: 30,
      hostRect: { left: 0, right: 1000 },
    });

    // idealLeft = 200 + 10 - 50 = 160, no clamping needed
    expect(result.left).toBe(160);
  });

  it('positions the tooltip above the trigger with a gap', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 200, top: 100, width: 20 },
      tooltipWidth: 100,
      tooltipHeight: 30,
      hostRect: { left: 0, right: 1000 },
    });

    // top = 100 - 30 - 6 = 64
    expect(result.top).toBe(64);
  });

  it('clamps to the left edge when the tooltip overflows left', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 10, top: 100, width: 20 },
      tooltipWidth: 100,
      tooltipHeight: 30,
      hostRect: { left: 0, right: 1000 },
    });

    // idealLeft = 10 + 10 - 50 = -30, minLeft = 0 + 8 = 8
    expect(result.left).toBe(8);
  });

  it('clamps to the right edge when the tooltip overflows right', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 480, top: 100, width: 20 },
      tooltipWidth: 100,
      tooltipHeight: 30,
      hostRect: { left: 0, right: 500 },
    });

    // idealLeft = 480 + 10 - 50 = 440, maxRight - tooltipWidth = 500 - 8 - 100 = 392
    expect(result.left).toBe(392);
  });

  it('accounts for a non-zero host left offset', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 110, top: 200, width: 20 },
      tooltipWidth: 100,
      tooltipHeight: 30,
      hostRect: { left: 100, right: 900 },
    });

    // idealLeft = 110 + 10 - 50 = 70, minLeft = 100 + 8 = 108
    expect(result.left).toBe(108);
  });

  it('uses viewport fallback when hostRect is null', () => {
    // jsdom default window.innerWidth is 1024
    const result = computeTooltipPosition({
      triggerRect: { left: 500, top: 100, width: 20 },
      tooltipWidth: 80,
      tooltipHeight: 24,
      hostRect: null,
    });

    // idealLeft = 500 + 10 - 40 = 470
    // minLeft = 0 + 8 = 8, maxRight = 1024 - 8 = 1016
    // 470 is within [8, 1016 - 80 = 936], so no clamping
    expect(result.left).toBe(470);
    expect(result.top).toBe(70);
  });

  it('handles a narrow host where both edges clamp', () => {
    const result = computeTooltipPosition({
      triggerRect: { left: 55, top: 100, width: 10 },
      tooltipWidth: 80,
      tooltipHeight: 20,
      hostRect: { left: 50, right: 150 },
    });

    // idealLeft = 55 + 5 - 40 = 20
    // minLeft = 50 + 8 = 58, maxRight - tooltipWidth = 150 - 8 - 80 = 62
    // clamp: max(58, min(20, 62)) = max(58, 20) = 58
    expect(result.left).toBe(58);
  });
});
