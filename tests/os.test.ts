import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../src/lib/api";
import {
  RawWindowSchema,
  MemoryStatsSchema,
  SessionSnapshotSchema,
} from "../src/lib/schemas";

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(),
  invoke: vi.fn(),
}));

import { invoke, isTauri } from "@tauri-apps/api/core";

const mockIsTauri = vi.mocked(isTauri);
const mockInvoke = vi.mocked(invoke);

describe("Zod - RawWindow & Memory Schemas", () => {
  it("validates RawWindow correctly", () => {
    const raw = {
      hwnd: "0x1234",
      hwnd_val: 4660,
      title: "VS Code",
      class_name: "Chrome_WidgetWin_1",
      process_id: 100,
      process_name: "Code.exe",
      exe_path: "C:\\Program Files\\Code.exe",
      rect: { x: 0, y: 0, width: 1920, height: 1080 },
      is_visible: true,
      is_minimized: false,
      is_maximized: true,
      ram_bytes: 250000000,
      is_elevated: false,
      z_order: 1,
    };
    expect(() => RawWindowSchema.parse(raw)).not.toThrow();
  });

  it("validates MemoryStats correctly", () => {
    const stats = {
      total_ram_bytes: 16000000000,
      used_ram_bytes: 8000000000,
      available_ram_bytes: 8000000000,
      memory_load_percentage: 50,
    };
    expect(() => MemoryStatsSchema.parse(stats)).not.toThrow();
  });
});

describe("Zod - SessionSnapshot Schema", () => {
  it("validates SessionSnapshot correctly", () => {
    const snapshot = {
      timestamp: 1700000000000,
      windows: [],
      total_ram_saved_bytes: 0,
    };
    expect(() => SessionSnapshotSchema.parse(snapshot)).not.toThrow();
  });
});

describe("API Client - OS Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_snapshot_session", async () => {
    mockInvoke.mockResolvedValueOnce({
      timestamp: 1700000000000,
      windows: [],
      total_ram_saved_bytes: 0,
    });
    const snap = await api.snapshotSession();
    expect(mockInvoke).toHaveBeenCalledWith("cmd_snapshot_session", undefined);
    expect(snap.timestamp).toBe(1700000000000);
  });

  it("invokes cmd_get_live_windows", async () => {
    mockInvoke.mockResolvedValueOnce([]);
    const wins = await api.getLiveWindows();
    expect(mockInvoke).toHaveBeenCalledWith("cmd_get_live_windows", undefined);
    expect(wins).toEqual([]);
  });

  it("invokes cmd_minimize_all", async () => {
    mockInvoke.mockResolvedValueOnce(5);
    const count = await api.minimizeAllWindows();
    expect(mockInvoke).toHaveBeenCalledWith("cmd_minimize_all", undefined);
    expect(count).toBe(5);
  });

  it("invokes cmd_get_memory_stats", async () => {
    mockInvoke.mockResolvedValueOnce({
      total_ram_bytes: 1000,
      used_ram_bytes: 400,
      available_ram_bytes: 600,
      memory_load_percentage: 40,
    });
    const stats = await api.getMemoryStats();
    expect(mockInvoke).toHaveBeenCalledWith("cmd_get_memory_stats", undefined);
    expect(stats.memory_load_percentage).toBe(40);
  });
});

describe("API Client - OS Window & Session Restore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_restore_window", async () => {
    mockInvoke.mockResolvedValueOnce(undefined);
    await api.restoreWindow("0x123", true);
    expect(mockInvoke).toHaveBeenCalledWith("cmd_restore_window", {
      hwnd: "0x123",
      isMaximized: true,
    });
  });

  it("invokes cmd_restore_session", async () => {
    mockInvoke.mockResolvedValueOnce(3);
    const restored = await api.restoreSessionById("s-1");
    expect(mockInvoke).toHaveBeenCalledWith("cmd_restore_session", {
      sessionId: "s-1",
    });
    expect(restored).toBe(3);
  });
});
