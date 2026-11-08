import { describe, it, expect } from "vitest";
import { sortWindows } from "../src/components/LiveWindowList";
import { formatBytes } from "../src/components/MemoryMeter";
import { resolveProcessIcon } from "../src/lib/processIcons";
import type { RawWindow } from "../src/lib/schemas";

const makeWindow = (
  hwnd: string,
  title: string,
  proc: string,
  ram: number,
  z: number
): RawWindow => ({
  hwnd,
  hwnd_val: 1,
  title,
  class_name: "Window",
  process_id: 100,
  process_name: proc,
  exe_path: null,
  rect: { x: 0, y: 0, width: 800, height: 600 },
  is_visible: true,
  is_minimized: false,
  is_maximized: false,
  ram_bytes: ram,
  is_elevated: false,
  z_order: z,
});

describe("Phase 7 - formatBytes Helper", () => {
  it("formats zero and small bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-100)).toBe("0 B");
    expect(formatBytes(500 * 1024 * 1024)).toBe("500 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1.0 GB");
    expect(formatBytes(8.5 * 1024 * 1024 * 1024)).toBe("8.5 GB");
  });
});

describe("Phase 7 - Process Icon Resolution", () => {
  it("resolves known executable names to semantic icons", () => {
    expect(resolveProcessIcon("Code.exe")).toBe("cpu");
    expect(resolveProcessIcon("chrome.exe")).toBe("globe");
    expect(resolveProcessIcon("powershell.exe")).toBe("terminal");
    expect(resolveProcessIcon("explorer.exe")).toBe("workspaces");
    expect(resolveProcessIcon("unknown.exe")).toBe("window");
  });

  it("caches resolved icons for performance", () => {
    const first = resolveProcessIcon("Code.exe");
    const second = resolveProcessIcon("Code.exe");
    expect(first).toBe(second);
  });
});

describe("Phase 7 - LiveWindowList Sorting", () => {
  const w1 = makeWindow("0x1", "Zebra Editor", "zebra.exe", 1000, 2);
  const w2 = makeWindow("0x2", "Alpha Browser", "alpha.exe", 5000, 1);
  const list = [w1, w2];

  it("sorts by memory descending", () => {
    const sorted = sortWindows(list, "memory");
    expect(sorted[0].hwnd).toBe("0x2");
    expect(sorted[1].hwnd).toBe("0x1");
  });

  it("sorts by title ascending", () => {
    const sorted = sortWindows(list, "title");
    expect(sorted[0].title).toBe("Alpha Browser");
    expect(sorted[1].title).toBe("Zebra Editor");
  });

  it("sorts by process name ascending", () => {
    const sorted = sortWindows(list, "process");
    expect(sorted[0].process_name).toBe("alpha.exe");
  });

  it("sorts by z-order", () => {
    const sorted = sortWindows(list, "zorder");
    expect(sorted[0].z_order).toBe(1);
  });
});
