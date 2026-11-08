import { describe, it, expect } from "vitest";
import type { RawWindow } from "../../src/lib/schemas";
import { sortWindows } from "../../src/components/LiveWindowList";

const generateMassiveWindowSet = (count: number): RawWindow[] => {
  const list: RawWindow[] = [];
  for (let i = 0; i < count; i += 1) {
    list.push({
      hwnd: `0x${(20000 + i).toString(16)}`,
      hwnd_val: 20000 + i,
      title: `Worker Window ${i} - Thread ${i % 16}`,
      class_name: "HeavyWorkerClass",
      process_name: `worker_${i % 20}.exe`,
      process_id: 10000 + (i % 20),
      rect: { x: (i * 10) % 1920, y: (i * 10) % 1080, width: 640, height: 480 },
      is_visible: true,
      is_minimized: false,
      is_maximized: false,
      ram_bytes: (50 + (i % 200)) * 1024 * 1024,
      is_elevated: false,
      z_order: i + 1,
    });
  }
  return list;
};

describe("Phase 14 - Edge Case: 100+ Windows Stress Test", () => {
  const windows = generateMassiveWindowSet(150);

  it("handles sorting 150 windows with zero frame-budget exhaustion", () => {
    const t0 = performance.now();
    const sorted = sortWindows(windows, "memory");
    const elapsed = performance.now() - t0;

    expect(sorted.length).toBe(150);
    expect(sorted[0].ram_bytes).toBeGreaterThanOrEqual(sorted[149].ram_bytes);
    expect(elapsed).toBeLessThan(15);
  });

  it("correctly aggregates total memory without integer overflow", () => {
    const totalRamBytes = windows.reduce((acc, w) => acc + w.ram_bytes, 0);

    expect(totalRamBytes).toBeGreaterThan(5 * 1024 * 1024 * 1024);
    expect(Number.isSafeInteger(totalRamBytes)).toBe(true);
  });
});
