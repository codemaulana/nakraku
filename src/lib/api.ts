import { invoke, isTauri } from "@tauri-apps/api/core";
import { z } from "zod";
import {
  WorkspaceSchema,
  CreateWorkspaceInputSchema,
  SessionSchema,
  CreateSessionInputSchema,
  WindowSchema,
  InsertWindowInputSchema,
  TabSchema,
  InsertTabInputSchema,
  SessionSnapshotSchema,
  RawWindowSchema,
  MemoryStatsSchema,
  StashResultSchema,
  RestoreResultSchema,
  QuickSwitchResultSchema,
  SessionDiffSchema,
  UndoItemSchema,
  type Workspace,
  type CreateWorkspaceInput,
  type Session,
  type CreateSessionInput,
  type WindowData,
  type InsertWindowInput,
  type TabData,
  type InsertTabInput,
  type SessionSnapshot,
  type RawWindow,
  type MemoryStats,
  type StashResult,
  type RestoreResult,
  type QuickSwitchResult,
  type SessionDiff,
  type UndoItem,
} from "./schemas";

export class ApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

const safeInvoke = async <T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> => {
  if (!isTauri()) {
    throw new ApiError(`Tauri IPC unavailable for command '${cmd}' in web mode`);
  }
  try {
    return await invoke<T>(cmd, args);
  } catch (err) {
    const msg = typeof err === "string" ? err : JSON.stringify(err);
    throw new ApiError(`Command '${cmd}' failed: ${msg}`, err);
  }
};

export const createWorkspace = async (
  input: CreateWorkspaceInput
): Promise<Workspace> => {
  const validatedInput = CreateWorkspaceInputSchema.parse(input);
  const raw = await safeInvoke<unknown>("create_workspace", { input: validatedInput });
  return WorkspaceSchema.parse(raw);
};

export const listWorkspaces = async (): Promise<Workspace[]> => {
  const raw = await safeInvoke<unknown>("list_workspaces");
  return z.array(WorkspaceSchema).parse(raw);
};

export const getWorkspace = async (id: string): Promise<Workspace> => {
  const raw = await safeInvoke<unknown>("get_workspace", { id });
  return WorkspaceSchema.parse(raw);
};

export const renameWorkspace = async (
  id: string,
  newName: string
): Promise<Workspace> => {
  const raw = await safeInvoke<unknown>("rename_workspace", {
    id,
    newName,
  });
  return WorkspaceSchema.parse(raw);
};

export const deleteWorkspace = async (id: string): Promise<boolean> => {
  const raw = await safeInvoke<boolean>("delete_workspace", { id });
  return Boolean(raw);
};

export const reorderWorkspaces = async (ids: string[]): Promise<void> => {
  await safeInvoke<void>("reorder_workspaces", { ids });
};

export const saveSession = async (
  input: CreateSessionInput
): Promise<Session> => {
  const validatedInput = CreateSessionInputSchema.parse(input);
  const raw = await safeInvoke<unknown>("save_session", { input: validatedInput });
  return SessionSchema.parse(raw);
};

export const listSessions = async (workspaceId: string): Promise<Session[]> => {
  const raw = await safeInvoke<unknown>("list_sessions", { workspaceId });
  return z.array(SessionSchema).parse(raw);
};

export const getSession = async (id: string): Promise<Session> => {
  const raw = await safeInvoke<unknown>("get_session", { id });
  return SessionSchema.parse(raw);
};

export const deleteSession = async (id: string): Promise<boolean> => {
  const raw = await safeInvoke<boolean>("delete_session", { id });
  return Boolean(raw);
};

export const saveSessionWindows = async (
  windows: InsertWindowInput[],
  tabs: InsertTabInput[]
): Promise<void> => {
  const validatedWindows = z.array(InsertWindowInputSchema).parse(windows);
  const validatedTabs = z.array(InsertTabInputSchema).parse(tabs);
  await safeInvoke<void>("save_session_windows", {
    windows: validatedWindows,
    tabs: validatedTabs,
  });
};

export const getSessionWindows = async (sessionId: string): Promise<WindowData[]> => {
  const raw = await safeInvoke<unknown>("get_session_windows", { sessionId });
  return z.array(WindowSchema).parse(raw);
};

export const getWindowTabs = async (windowId: string): Promise<TabData[]> => {
  const raw = await safeInvoke<unknown>("get_window_tabs", { windowId });
  return z.array(TabSchema).parse(raw);
};

export const getSetting = async (key: string): Promise<string | null> => {
  const raw = await safeInvoke<string | null>("get_setting", { key });
  return raw ?? null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  await safeInvoke<void>("set_setting", { key, value });
};

export const backupDatabase = async (): Promise<string> => {
  const raw = await safeInvoke<string>("backup_database");
  return String(raw);
};

export const snapshotSession = async (): Promise<SessionSnapshot> => {
  const raw = await safeInvoke<unknown>("cmd_snapshot_session");
  return SessionSnapshotSchema.parse(raw);
};

export const getLiveWindows = async (): Promise<RawWindow[]> => {
  const raw = await safeInvoke<unknown>("cmd_get_live_windows");
  return z.array(RawWindowSchema).parse(raw);
};

export const minimizeAllWindows = async (): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_minimize_all");
  return Number(raw);
};

export const getMemoryStats = async (): Promise<MemoryStats> => {
  const raw = await safeInvoke<unknown>("cmd_get_memory_stats");
  return MemoryStatsSchema.parse(raw);
};

export const restoreWindow = async (
  hwnd: string,
  isMaximized: boolean
): Promise<void> => {
  await safeInvoke<void>("cmd_restore_window", { hwnd, isMaximized });
};

export const restoreSessionById = async (
  sessionId: string
): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_restore_session", { sessionId });
  return Number(raw);
};

export const stashNow = async (
  workspaceId: string,
  sessionName: string
): Promise<StashResult> => {
  const raw = await safeInvoke<unknown>("cmd_stash_now", {
    workspaceId,
    sessionName,
  });
  return StashResultSchema.parse(raw);
};

export const restoreWorkspace = async (
  workspaceId: string
): Promise<RestoreResult> => {
  const raw = await safeInvoke<unknown>("cmd_restore_workspace", {
    workspaceId,
  });
  return RestoreResultSchema.parse(raw);
};

export const quickSwitch = async (
  fromWorkspaceId: string,
  toWorkspaceId: string
): Promise<QuickSwitchResult> => {
  const raw = await safeInvoke<unknown>("cmd_quick_switch", {
    fromWorkspaceId,
    toWorkspaceId,
  });
  return QuickSwitchResultSchema.parse(raw);
};

export const undoLastOperation = async (): Promise<UndoItem> => {
  const raw = await safeInvoke<unknown>("cmd_undo_last_operation");
  return UndoItemSchema.parse(raw);
};

export const getUndoStackSize = async (): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_get_undo_stack_size");
  return Number(raw);
};

export const createWorkspaceValidated = async (
  name: string,
  color?: string,
  icon?: string
): Promise<Workspace> => {
  const raw = await safeInvoke<unknown>("cmd_create_workspace_validated", {
    name,
    color,
    icon,
  });
  return WorkspaceSchema.parse(raw);
};

export const diffLiveWithSession = async (
  sessionId: string
): Promise<SessionDiff> => {
  const raw = await safeInvoke<unknown>("cmd_diff_live_with_session", {
    sessionId,
  });
  return SessionDiffSchema.parse(raw);
};

export const triggerAutoSnapshot = async (
  workspaceId: string
): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_trigger_auto_snapshot", {
    workspaceId,
  });
  return String(raw);
};
