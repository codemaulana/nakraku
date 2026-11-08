import { describe, it, expect, vi, beforeEach } from "vitest";
import * as api from "../src/lib/api";
import {
  WorkspaceSchema,
  SessionSchema,
  WindowSchema,
  TabSchema,
} from "../src/lib/schemas";

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: vi.fn(),
  invoke: vi.fn(),
}));

import { invoke, isTauri } from "@tauri-apps/api/core";

const mockIsTauri = vi.mocked(isTauri);
const mockInvoke = vi.mocked(invoke);

describe("Zod - Workspace Schema", () => {
  it("validates Workspace schema correctly", () => {
    const valid = {
      id: "ws-1",
      name: "Dev Workspace",
      color: "#10B981",
      icon: "workspace",
      sort_order: 0,
      is_active: true,
      created_at: 1700000000000,
      updated_at: 1700000000000,
    };
    expect(() => WorkspaceSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid Workspace missing name", () => {
    const invalid = {
      id: "ws-1",
      name: "",
      color: "#10B981",
      sort_order: 0,
      is_active: false,
      created_at: 1700000000000,
      updated_at: 1700000000000,
    };
    expect(() => WorkspaceSchema.parse(invalid)).toThrow();
  });
});

describe("Zod - Session and Window Schemas", () => {
  it("validates Session schema", () => {
    const session = {
      id: "s-1",
      workspace_id: "ws-1",
      name: "Morning",
      window_count: 2,
      ram_saved_bytes: 500000,
      is_frozen: true,
      snapshot_at: 1700000000000,
      created_at: 1700000000000,
    };
    expect(() => SessionSchema.parse(session)).not.toThrow();
  });

  it("validates Window schema", () => {
    const window = {
      id: "w-1",
      session_id: "s-1",
      hwnd: "0x123",
      process_id: 100,
      process_name: "Code.exe",
      title: "VS Code",
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      is_minimized: false,
      is_maximized: true,
      ram_bytes: 200000,
      z_order: 1,
    };
    expect(() => WindowSchema.parse(window)).not.toThrow();
  });

  it("validates Tab schema", () => {
    const tab = {
      id: "t-1",
      window_id: "w-1",
      session_id: "s-1",
      url: "https://github.com/nakraku",
      title: "GitHub",
      tab_index: 0,
      is_active: true,
    };
    expect(() => TabSchema.parse(tab)).not.toThrow();
  });
});

describe("API Client - Workspace Calls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTauri.mockReturnValue(true);
  });

  it("creates workspace and parses typed response", async () => {
    const mockResult = {
      id: "ws-1",
      name: "Test",
      color: "#10B981",
      icon: "workspace",
      sort_order: 0,
      is_active: false,
      created_at: 1700000000000,
      updated_at: 1700000000000,
    };
    mockInvoke.mockResolvedValueOnce(mockResult);

    const result = await api.createWorkspace({
      id: "ws-1",
      name: "Test",
    });

    expect(mockInvoke).toHaveBeenCalledWith("create_workspace", {
      input: { id: "ws-1", name: "Test" },
    });
    expect(result.id).toBe("ws-1");
  });

  it("lists workspaces successfully", async () => {
    mockInvoke.mockResolvedValueOnce([
      {
        id: "ws-1",
        name: "WS 1",
        color: "#10B981",
        sort_order: 0,
        is_active: true,
        created_at: 100,
        updated_at: 100,
      },
    ]);

    const list = await api.listWorkspaces();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("ws-1");
  });
});

describe("API Client - Fallbacks & Backup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws ApiError if outside Tauri environment", async () => {
    mockIsTauri.mockReturnValue(false);
    await expect(api.listWorkspaces()).rejects.toThrow(api.ApiError);
  });

  it("handles database backup call", async () => {
    mockIsTauri.mockReturnValue(true);
    mockInvoke.mockResolvedValueOnce("C:\\data\\stash.db.bak");
    const path = await api.backupDatabase();
    expect(path).toBe("C:\\data\\stash.db.bak");
  });
});
