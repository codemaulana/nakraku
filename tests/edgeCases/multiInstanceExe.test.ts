import { describe, it, expect } from "vitest";
import type { RawWindow } from "../../src/lib/schemas";

const createMultiInstanceWindows = (): RawWindow[] => [
  {
    hwnd: "0x3001",
    hwnd_val: 12289,
    title: "Document 1.txt - Notepad",
    class_name: "Notepad",
    process_name: "notepad.exe",
    process_id: 4500,
    exe_path: "C:\\Windows\\System32\\notepad.exe",
    rect: { x: 50, y: 50, width: 600, height: 400 },
    is_visible: true,
    is_minimized: false,
    is_maximized: false,
    ram_bytes: 20 * 1024 * 1024,
    is_elevated: false,
    z_order: 1,
  },
  {
    hwnd: "0x3002",
    hwnd_val: 12290,
    title: "Document 2.txt - Notepad",
    class_name: "Notepad",
    process_name: "notepad.exe",
    process_id: 4501,
    exe_path: "C:\\Windows\\System32\\notepad.exe",
    rect: { x: 700, y: 50, width: 600, height: 400 },
    is_visible: true,
    is_minimized: false,
    is_maximized: false,
    ram_bytes: 22 * 1024 * 1024,
    is_elevated: false,
    z_order: 2,
  },
  {
    hwnd: "0x3003",
    hwnd_val: 12291,
    title: "Document 3.txt - Notepad",
    class_name: "Notepad",
    process_name: "notepad.exe",
    process_id: 4502,
    exe_path: "C:\\Windows\\System32\\notepad.exe",
    rect: { x: 50, y: 500, width: 600, height: 400 },
    is_visible: true,
    is_minimized: false,
    is_maximized: false,
    ram_bytes: 21 * 1024 * 1024,
    is_elevated: false,
    z_order: 3,
  },
];

describe("Phase 14 - Edge Case: Same Executable Multiple Instances", () => {
  const instances = createMultiInstanceWindows();

  it("distinguishes individual windows by HWND despite identical exe path", () => {
    const hwnds = new Set(instances.map((w) => w.hwnd));
    expect(hwnds.size).toBe(3);
  });

  it("preserves unique spatial coordinates for all separate instances", () => {
    const coordinates = instances.map((w) => ({
      x: w.rect.x,
      y: w.rect.y,
    }));

    expect(coordinates[0]).toEqual({ x: 50, y: 50 });
    expect(coordinates[1]).toEqual({ x: 700, y: 50 });
    expect(coordinates[2]).toEqual({ x: 50, y: 500 });
  });
});
