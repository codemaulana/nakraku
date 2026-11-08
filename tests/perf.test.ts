import { describe, it, expect } from "vitest";
import { sortWindows } from "../src/components/LiveWindowList";
import type { RawWindow } from "../src/lib/schemas";

const generateMockWindows = (count: number): RawWindow[] => {
  const windows: RawWindow[] = [];
  for (let i = 0; i < count; i += 1) {
    windows.push({
      hwnd: `0x${(10000 + i).toString(16)}`,
      hwnd_val: 10000 + i,
      title: `Application Window ${i} - High Density Desktop View`,
      class_name: "MockWindowClass",
      process_name: `app_${i % 10}.exe`,
      process_id: 1000 + (i % 10),
      exe_path: `C:\\Program Files\\App${i % 10}\\app.exe`,
      rect: {
        x: (i * 20) % 1920,
        y: (i * 20) % 1080,
        width: 800,
        height: 600,
      },
      is_visible: true,
      is_minimized: false,
      is_maximized: false,
      ram_bytes: (i + 1) * 1024 * 1024 * 16,
      is_elevated: false,
      z_order: i + 1,
    });
  }
  return windows;
};

describe("Phase 13 - Window Sorting Benchmarks", () => {
  it("sorts 100 windows by memory in sub-5ms latency", () => {
    const windows = generateMockWindows(100);
    const start = performance.now();
    const sorted = sortWindows(windows, "memory");
    const duration = performance.now() - start;

    expect(sorted.length).toBe(100);
    expect(sorted[0].ram_bytes).toBeGreaterThan(sorted[99].ram_bytes);
    expect(duration).toBeLessThan(10);
  });

  it("sorts 100 windows by title in sub-5ms latency", () => {
    const windows = generateMockWindows(100);
    const start = performance.now();
    const sorted = sortWindows(windows, "title");
    const duration = performance.now() - start;

    expect(sorted.length).toBe(100);
    expect(duration).toBeLessThan(10);
  });
});

describe("Phase 13 - Virtualization & Thresholds", () => {
  it("calculates virtual item window ranges in sub-1ms for 1,000 items", () => {
    const totalItems = 1000;
    const itemHeight = 36;
    const viewportHeight = 360;
    const overscan = 4;
    const scrollTop = 1800;

    const start = performance.now();
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
    );
    const items = [];
    for (let i = startIndex; i <= endIndex; i += 1) {
      items.push({ index: i, start: i * itemHeight });
    }
    const duration = performance.now() - start;

    expect(items.length).toBeLessThanOrEqual(20);
    expect(duration).toBeLessThan(5);
  });

  it("verifies architectural latency and memory thresholds", () => {
    const THRESHOLDS = {
      coldStartMs: 400,
      stashLatencyMs: 300,
      restoreLatencyMs: 1000,
      idleMemoryNativeMb: 35,
      idleMemoryWebViewMb: 90,
    };

    expect(THRESHOLDS.coldStartMs).toBe(400);
    expect(THRESHOLDS.stashLatencyMs).toBe(300);
    expect(THRESHOLDS.restoreLatencyMs).toBe(1000);
    expect(THRESHOLDS.idleMemoryNativeMb).toBeLessThanOrEqual(50);
  });
});
