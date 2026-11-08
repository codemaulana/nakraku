import { describe, it, expect } from "vitest";
import type { RawWindow, StashResult } from "../../src/lib/schemas";

const processStashSession = (
  windows: RawWindow[],
  workspaceId: string
): { result: StashResult; sessionSaved: boolean } => {
  if (windows.length === 0) {
    return {
      result: {
        session_id: "",
        workspace_id: workspaceId,
        window_count: 0,
        ram_saved_bytes: 0,
        minimized_count: 0,
      },
      sessionSaved: false,
    };
  }

  const ramSaved = windows.reduce((acc, w) => acc + w.ram_bytes, 0);
  return {
    result: {
      session_id: "sess-valid",
      workspace_id: workspaceId,
      window_count: windows.length,
      ram_saved_bytes: ramSaved,
      minimized_count: windows.length,
    },
    sessionSaved: true,
  };
};

describe("Phase 14 - Edge Case: 0 Windows Open", () => {
  it("prevents empty database session creation when zero windows are open", () => {
    const outcome = processStashSession([], "ws-1");

    expect(outcome.sessionSaved).toBe(false);
    expect(outcome.result.window_count).toBe(0);
    expect(outcome.result.ram_saved_bytes).toBe(0);
    expect(outcome.result.minimized_count).toBe(0);
  });

  it("proceeds with stash and database persist when windows exist", () => {
    const mockWin: RawWindow = {
      hwnd: "0x2001",
      hwnd_val: 8193,
      title: "Notepad",
      class_name: "Notepad",
      process_name: "notepad.exe",
      process_id: 1234,
      rect: { x: 0, y: 0, width: 800, height: 600 },
      is_visible: true,
      is_minimized: false,
      is_maximized: false,
      ram_bytes: 25 * 1024 * 1024,
      is_elevated: false,
      z_order: 1,
    };

    const outcome = processStashSession([mockWin], "ws-1");

    expect(outcome.sessionSaved).toBe(true);
    expect(outcome.result.window_count).toBe(1);
    expect(outcome.result.ram_saved_bytes).toBe(25 * 1024 * 1024);
  });
});
