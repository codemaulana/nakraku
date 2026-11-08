import { vi } from "vitest";
import type {
  Workspace,
  Session,
  RawWindow,
  StashResult,
  RestoreResult,
} from "../../src/lib/schemas";

export interface MockSystemState {
  workspaces: Workspace[];
  sessions: Session[];
  windows: RawWindow[];
  isPro: boolean;
  failOsCalls: boolean;
  minimizedHwnds: Set<string>;
}

const MOCK_WORKSPACES: readonly Workspace[] = [
  {
    id: "ws-1",
    name: "Workspace 1",
    icon: "workspaces",
    color: "#10B981",
    sort_order: 0,
    is_active: true,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
  {
    id: "ws-2",
    name: "Workspace 2",
    icon: "workspaces",
    color: "#3B82F6",
    sort_order: 1,
    is_active: false,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
  {
    id: "ws-3",
    name: "Workspace 3",
    icon: "workspaces",
    color: "#8B5CF6",
    sort_order: 2,
    is_active: false,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
];

const MOCK_WINDOWS: readonly RawWindow[] = [
  {
    hwnd: "0x1001",
    hwnd_val: 4097,
    title: "Visual Studio Code - nakraku",
    class_name: "Chrome_WidgetWin_1",
    process_name: "Code.exe",
    process_id: 5420,
    exe_path: "C:\\Program Files\\VSCode\\Code.exe",
    rect: { x: 0, y: 0, width: 1920, height: 1080 },
    is_visible: true,
    is_minimized: false,
    is_maximized: true,
    ram_bytes: 420 * 1024 * 1024,
    is_elevated: false,
    z_order: 1,
  },
  {
    hwnd: "0x1002",
    hwnd_val: 4098,
    title: "Google Chrome - GitHub",
    class_name: "Chrome_WidgetWin_1",
    process_name: "chrome.exe",
    process_id: 8890,
    exe_path: "C:\\Program Files\\Google\\Chrome\\chrome.exe",
    rect: { x: 100, y: 100, width: 1200, height: 800 },
    is_visible: true,
    is_minimized: false,
    is_maximized: false,
    ram_bytes: 650 * 1024 * 1024,
    is_elevated: false,
    z_order: 2,
  },
];

export const createInitialMockState = (): MockSystemState => ({
  workspaces: [...MOCK_WORKSPACES],
  sessions: [],
  windows: [...MOCK_WINDOWS],
  isPro: false,
  failOsCalls: false,
  minimizedHwnds: new Set(),
});

const sharedStateHolder = {
  current: createInitialMockState(),
};

const handleWorkspaceCmd = (
  state: MockSystemState,
  cmd: string,
  args?: Record<string, unknown>
): unknown => {
  if (cmd === "list_workspaces") return [...state.workspaces];
  if (cmd === "get_setting") return null;
  if (cmd === "cmd_get_license_status") {
    return {
      tier: state.isPro ? "pro" : "free",
      is_pro: state.isPro,
      machine_id: "TEST-MACHINE-12345",
      activated_at: state.isPro ? 1700000000000 : null,
      expires_at: null,
    };
  }
  if (cmd === "get_workspace") {
    const id = args?.id as string;
    const found = state.workspaces.find((w) => w.id === id);
    if (!found) throw new Error(`Workspace ${id} not found`);
    return found;
  }
  if (cmd === "cmd_create_workspace_validated") {
    const name = args?.name as string;
    if (!state.isPro && state.workspaces.length >= 3) {
      throw new Error("Free tier limit reached (max 3 workspaces)");
    }
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      icon: "workspaces",
      color: (args?.color as string) || "#10B981",
      sort_order: state.workspaces.length,
      is_active: false,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    state.workspaces.push(newWs);
    return newWs;
  }
  return undefined;
};

const executeMockStash = (
  state: MockSystemState,
  wsId: string,
  sessName: string
): StashResult => {
  const newSession: Session = {
    id: `sess-${Date.now()}`,
    workspace_id: wsId,
    name: sessName,
    window_count: state.windows.length,
    ram_saved_bytes: 1070 * 1024 * 1024,
    is_frozen: true,
    snapshot_at: Date.now(),
    created_at: Date.now(),
  };
  state.sessions.push(newSession);
  for (const w of state.windows) state.minimizedHwnds.add(w.hwnd);
  return {
    session_id: newSession.id,
    workspace_id: wsId,
    window_count: state.windows.length,
    ram_saved_bytes: 1070 * 1024 * 1024,
    minimized_count: state.windows.length,
  };
};

const executeMockRestore = (
  state: MockSystemState,
  wsId: string
): RestoreResult => {
  state.minimizedHwnds.clear();
  for (const w of state.workspaces) w.is_active = w.id === wsId;
  return {
    session_id: `sess-${Date.now()}`,
    workspace_id: wsId,
    restored_count: state.windows.length,
  };
};

const handleStashCmd = (
  state: MockSystemState,
  cmd: string,
  args?: Record<string, unknown>
): unknown => {
  if (cmd === "cmd_get_live_windows") return [...state.windows];
  if (cmd === "cmd_get_memory_stats") {
    return {
      total_ram_bytes: 32 * 1024 * 1024 * 1024,
      used_ram_bytes: 14 * 1024 * 1024 * 1024,
      app_ram_bytes: 84 * 1024 * 1024,
      tracked_windows_count: state.windows.length,
    };
  }
  if (cmd === "cmd_stash_now") {
    const wsId = args?.workspaceId as string;
    const sessName = (args?.sessionName as string) || "Snapshot";
    return executeMockStash(state, wsId, sessName);
  }
  if (cmd === "cmd_restore_workspace") {
    const wsId = args?.workspaceId as string;
    return executeMockRestore(state, wsId);
  }
  return undefined;
};

const handleInvoke = (
  cmd: string,
  args?: Record<string, unknown>
): unknown => {
  const state = sharedStateHolder.current;
  if (state.failOsCalls && cmd.startsWith("cmd_")) {
    throw new Error(`Win32 OS Error: Access is denied during ${cmd}`);
  }
  const wsRes = handleWorkspaceCmd(state, cmd, args);
  if (wsRes !== undefined) return wsRes;
  const stashRes = handleStashCmd(state, cmd, args);
  if (stashRes !== undefined) return stashRes;
  throw new Error(`Unhandled mock command: ${cmd}`);
};

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: vi.fn((cmd: string, args?: Record<string, unknown>) =>
    Promise.resolve(handleInvoke(cmd, args))
  ),
}));

export const setupMockTauri = (customState?: Partial<MockSystemState>) => {
  sharedStateHolder.current = {
    ...createInitialMockState(),
    ...customState,
  };
  return {
    state: sharedStateHolder.current,
    reset: (state?: Partial<MockSystemState>) => {
      sharedStateHolder.current = {
        ...createInitialMockState(),
        ...state,
      };
    },
  };
};
