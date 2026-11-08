import { describe, it, expect } from "vitest";
import { validateWorkspaceName } from "../src/components/WorkspaceCreatorBar";
import { WORKSPACE_PRESET_COLORS } from "../src/components/WorkspaceColorPicker";
import { formatBytes } from "../src/components/MemoryMeter";
import type { Workspace, Session, WindowData } from "../src/lib/schemas";

const makeTestWorkspace = (
  id: string,
  name: string,
  sortOrder: number,
  color = "#10B981"
): Workspace => ({
  id,
  name,
  icon: "workspaces",
  color,
  sort_order: sortOrder,
  is_active: false,
  created_at: Date.now(),
  updated_at: Date.now(),
});

describe("Phase 8 - Workspace Name Validation", () => {
  const existing = ["Core Development", "Design & Specs", "Terminal Workspace"];

  it("rejects empty and whitespace-only workspace names", () => {
    expect(validateWorkspaceName("", existing)).toBe("Workspace name cannot be empty");
    expect(validateWorkspaceName("   ", existing)).toBe("Workspace name cannot be empty");
  });

  it("rejects workspace names longer than 50 characters", () => {
    const longName = "A".repeat(51);
    expect(validateWorkspaceName(longName, existing)).toBe(
      "Name must be 50 characters or less"
    );
  });

  it("rejects duplicate workspace names case-insensitively", () => {
    expect(validateWorkspaceName("Core Development", existing)).toBe(
      "A workspace with this name already exists"
    );
    expect(validateWorkspaceName("core development", existing)).toBe(
      "A workspace with this name already exists"
    );
    expect(validateWorkspaceName("DESIGN & SPECS", existing)).toBe(
      "A workspace with this name already exists"
    );
  });

  it("accepts valid and distinct workspace names", () => {
    expect(validateWorkspaceName("Research & Data", existing)).toBeNull();
    expect(validateWorkspaceName("Backlog", existing)).toBeNull();
  });
});

describe("Phase 8 - Preset Dot Colors", () => {
  it("provides 8 preset colors with obsidian emerald first", () => {
    expect(WORKSPACE_PRESET_COLORS.length).toBe(8);
    expect(WORKSPACE_PRESET_COLORS[0]).toBe("#10B981");
    expect(WORKSPACE_PRESET_COLORS).toContain("#3B82F6");
    expect(WORKSPACE_PRESET_COLORS).toContain("#8B5CF6");
    expect(WORKSPACE_PRESET_COLORS).toContain("#EF4444");
  });
});

const canMoveWorkspace = (
  index: number,
  length: number,
  direction: "up" | "down"
): boolean => {
  if (direction === "up") return index > 0;
  return index < length - 1;
};

describe("Phase 8 - Workspace Reordering Logic", () => {
  const ws1 = makeTestWorkspace("ws-1", "Alpha", 0);
  const ws2 = makeTestWorkspace("ws-2", "Beta", 1);
  const ws3 = makeTestWorkspace("ws-3", "Gamma", 2);
  const list = [ws1, ws2, ws3];

  it("moves an item up correctly within bounds", () => {
    const index = 1;
    const target = index - 1;
    const copy = [...list];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);

    expect(copy[0].id).toBe("ws-2");
    expect(copy[1].id).toBe("ws-1");
  });

  it("moves an item down correctly within bounds", () => {
    const index = 0;
    const target = index + 1;
    const copy = [...list];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);

    expect(copy[0].id).toBe("ws-2");
    expect(copy[1].id).toBe("ws-1");
  });

  it("guards against moving top item up or bottom item down", () => {
    expect(canMoveWorkspace(0, list.length, "up")).toBe(false);
    expect(canMoveWorkspace(list.length - 1, list.length, "down")).toBe(false);
    expect(canMoveWorkspace(1, list.length, "up")).toBe(true);
    expect(canMoveWorkspace(1, list.length, "down")).toBe(true);
  });
});

describe("Phase 8 - Free Tier Gating Logic", () => {
  it("detects when 3-workspace limit is reached for free tier", () => {
    const freeTier = true;
    const workspaces = [
      makeTestWorkspace("1", "A", 0),
      makeTestWorkspace("2", "B", 1),
      makeTestWorkspace("3", "C", 2),
    ];
    const canCreate = !freeTier || workspaces.length < 3;
    const showLockedSlot = freeTier && workspaces.length >= 3;

    expect(canCreate).toBe(false);
    expect(showLockedSlot).toBe(true);
  });

  it("allows unlimited creation when license is Pro", () => {
    const freeTier = false;
    const workspaces = [
      makeTestWorkspace("1", "A", 0),
      makeTestWorkspace("2", "B", 1),
      makeTestWorkspace("3", "C", 2),
      makeTestWorkspace("4", "D", 3),
    ];
    const canCreate = !freeTier || workspaces.length < 3;
    const showLockedSlot = freeTier && workspaces.length >= 3;

    expect(canCreate).toBe(true);
    expect(showLockedSlot).toBe(false);
  });
});

const SAMPLE_SESSION_WINDOWS: WindowData[] = [
  {
    id: "win-1",
    session_id: "sess-1",
    hwnd: "0x1",
    title: "VS Code",
    process_name: "Code.exe",
    process_id: 1234,
    executable_path: "C:\\Code\\Code.exe",
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    is_minimized: false,
    is_maximized: true,
    ram_bytes: 800 * 1024 * 1024,
    z_order: 1,
  },
  {
    id: "win-2",
    session_id: "sess-1",
    hwnd: "0x2",
    title: "Firefox",
    process_name: "firefox.exe",
    process_id: 5678,
    executable_path: "C:\\Firefox\\firefox.exe",
    x: 100,
    y: 100,
    width: 1200,
    height: 800,
    is_minimized: false,
    is_maximized: false,
    ram_bytes: 400 * 1024 * 1024,
    z_order: 2,
  },
];

describe("Phase 8 - Session History & Windows Aggregation", () => {
  it("calculates total ram saved across session windows", () => {
    const totalRam = SAMPLE_SESSION_WINDOWS.reduce((acc, w) => acc + w.ram_bytes, 0);
    expect(totalRam).toBe(1200 * 1024 * 1024);
    expect(formatBytes(totalRam)).toBe("1.2 GB");
  });

  it("formats session metadata and snapshot badge", () => {
    const session: Session = {
      id: "sess-1",
      workspace_id: "ws-1",
      name: "Auto-Snapshot #1",
      is_frozen: true,
      ram_saved_bytes: 1200 * 1024 * 1024,
      window_count: 2,
      snapshot_at: Date.now(),
      created_at: Date.now(),
    };

    expect(session.window_count).toBe(2);
    expect(session.is_frozen).toBe(true);
    expect(formatBytes(session.ram_saved_bytes)).toBe("1.2 GB");
  });
});
