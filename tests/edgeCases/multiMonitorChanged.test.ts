import { describe, it, expect } from "vitest";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DisplayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const clampWindowToDisplay = (
  windowRect: Rect,
  display: DisplayBounds
): Rect => {
  const maxX = display.x + display.width - windowRect.width;
  const maxY = display.y + display.height - windowRect.height;

  const clampedX = Math.max(display.x, Math.min(windowRect.x, Math.max(display.x, maxX)));
  const clampedY = Math.max(display.y, Math.min(windowRect.y, Math.max(display.y, maxY)));

  const clampedWidth = Math.min(windowRect.width, display.width);
  const clampedHeight = Math.min(windowRect.height, display.height);

  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight,
  };
};

describe("Phase 14 - Edge Case: Monitor Configuration Changed", () => {
  const primaryDisplay: DisplayBounds = {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
  };

  it("clamps disconnected secondary monitor coordinates to primary screen", () => {
    const stashedOnSecondary: Rect = {
      x: 2100,
      y: 150,
      width: 800,
      height: 600,
    };

    const restored = clampWindowToDisplay(stashedOnSecondary, primaryDisplay);

    expect(restored.x).toBeLessThanOrEqual(primaryDisplay.width - restored.width);
    expect(restored.x).toBe(1120);
    expect(restored.y).toBe(150);
  });

  it("downscales oversized window to fit smaller laptop screen", () => {
    const hugeWindow: Rect = {
      x: 0,
      y: 0,
      width: 2560,
      height: 1440,
    };

    const restored = clampWindowToDisplay(hugeWindow, primaryDisplay);

    expect(restored.width).toBe(1920);
    expect(restored.height).toBe(1080);
    expect(restored.x).toBe(0);
    expect(restored.y).toBe(0);
  });
});
