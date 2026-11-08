import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../src/lib/api";
import {
  StashResultSchema,
  RestoreResultSchema,
  QuickSwitchResultSchema,
  SessionDiffSchema,
  UndoItemSchema,
} from "../src/lib/schemas";

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(),
  invoke: vi.fn(),
}));

import { invoke, isTauri } from "@tauri-apps/api/core";

const mockIsTauri = vi.mocked(isTauri);
const mockInvoke = vi.mocked(invoke);

describe("Zod - Stash & Restore Schemas", () => {
  it("validates StashResult correctly", () => {
    const res = {
      session_id: "s-1",
      workspace_id: "ws-1",
      window_count: 5,
      ram_saved_bytes: 400000000,
      minimized_count: 5,
    };
    expect(() => StashResultSchema.parse(res)).not.toThrow();
  });

  it("validates RestoreResult and QuickSwitchResult", () => {
    const restore = {
      session_id: "s-1",
      workspace_id: "ws-1",
      restored_count: 5,
    };
    expect(() => RestoreResultSchema.parse(restore)).not.toThrow();

    const quick = {
      stashed: {
        session_id: "s-1",
        workspace_id: "ws-1",
        window_count: 3,
        ram_saved_bytes: 100000,
        minimized_count: 3,
      },
      restored: restore,
    };
    expect(() => QuickSwitchResultSchema.parse(quick)).not.toThrow();
  });
});

describe("Zod - SessionDiff & Undo Schemas", () => {
  it("validates SessionDiff correctly", () => {
    const diff = {
      added_windows: [],
      removed_windows: [],
      moved_windows: [
        {
          process_name: "Code.exe",
          title: "VS Code",
          old_x: 0,
          old_y: 0,
          new_x: 100,
          new_y: 100,
        },
      ],
      unchanged_count: 2,
    };
    expect(() => SessionDiffSchema.parse(diff)).not.toThrow();
  });

  it("validates UndoItem correctly", () => {
    const undo = {
      id: "undo-1",
      action_type: "stash",
      workspace_id: "ws-1",
      session_id: "s-1",
      timestamp: 1700000000000,
      window_hwnds: ["0x123", "0x456"],
    };
    expect(() => UndoItemSchema.parse(undo)).not.toThrow();
  });
});

describe("API Client - Stash Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_stash_now", async () => {
    mockInvoke.mockResolvedValueOnce({
      session_id: "s-1",
      workspace_id: "ws-1",
      window_count: 2,
      ram_saved_bytes: 50000,
      minimized_count: 2,
    });
    const res = await api.stashNow("ws-1", "Morning Stash");
    expect(mockInvoke).toHaveBeenCalledWith("cmd_stash_now", {
      workspaceId: "ws-1",
      sessionName: "Morning Stash",
    });
    expect(res.session_id).toBe("s-1");
  });

  it("invokes cmd_restore_workspace", async () => {
    mockInvoke.mockResolvedValueOnce({
      session_id: "s-1",
      workspace_id: "ws-1",
      restored_count: 2,
    });
    const res = await api.restoreWorkspace("ws-1");
    expect(mockInvoke).toHaveBeenCalledWith("cmd_restore_workspace", {
      workspaceId: "ws-1",
    });
    expect(res.restored_count).toBe(2);
  });
});

describe("API Client - Quick Switch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_quick_switch", async () => {
    mockInvoke.mockResolvedValueOnce({
      stashed: {
        session_id: "s-1",
        workspace_id: "ws-1",
        window_count: 1,
        ram_saved_bytes: 100,
        minimized_count: 1,
      },
      restored: {
        session_id: "s-2",
        workspace_id: "ws-2",
        restored_count: 2,
      },
    });
    const res = await api.quickSwitch("ws-1", "ws-2");
    expect(mockInvoke).toHaveBeenCalledWith("cmd_quick_switch", {
      fromWorkspaceId: "ws-1",
      toWorkspaceId: "ws-2",
    });
    expect(res.restored.workspace_id).toBe("ws-2");
  });
});

describe("API Client - Undo Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_undo_last_operation", async () => {
    mockInvoke.mockResolvedValueOnce({
      id: "u-1",
      action_type: "stash",
      workspace_id: "ws-1",
      session_id: "s-1",
      timestamp: 100,
      window_hwnds: ["0x1"],
    });
    const res = await api.undoLastOperation();
    expect(mockInvoke).toHaveBeenCalledWith(
      "cmd_undo_last_operation",
      undefined
    );
    expect(res.action_type).toBe("stash");
  });

  it("invokes cmd_get_undo_stack_size", async () => {
    mockInvoke.mockResolvedValueOnce(3);
    const size = await api.getUndoStackSize();
    expect(mockInvoke).toHaveBeenCalledWith(
      "cmd_get_undo_stack_size",
      undefined
    );
    expect(size).toBe(3);
  });
});

describe("API Client - Workspace Validation & Diff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("invokes cmd_create_workspace_validated", async () => {
    mockInvoke.mockResolvedValueOnce({
      id: "ws-1",
      name: "Research",
      color: "#10B981",
      icon: "book",
      sort_order: 0,
      is_active: false,
      created_at: 100,
      updated_at: 100,
    });
    const ws = await api.createWorkspaceValidated(
      "Research",
      "#10B981",
      "book"
    );
    expect(mockInvoke).toHaveBeenCalledWith("cmd_create_workspace_validated", {
      name: "Research",
      color: "#10B981",
      icon: "book",
    });
    expect(ws.name).toBe("Research");
  });

  it("invokes cmd_diff_live_with_session and cmd_trigger_auto_snapshot", async () => {
    mockInvoke.mockResolvedValueOnce({
      added_windows: [],
      removed_windows: [],
      moved_windows: [],
      unchanged_count: 3,
    });
    const diff = await api.diffLiveWithSession("s-1");
    expect(diff.unchanged_count).toBe(3);

    mockInvoke.mockResolvedValueOnce("auto_123");
    const autoId = await api.triggerAutoSnapshot("ws-1");
    expect(autoId).toBe("auto_123");
  });
});
