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
  type Workspace,
  type CreateWorkspaceInput,
  type Session,
  type CreateSessionInput,
  type WindowData,
  type InsertWindowInput,
  type TabData,
  type InsertTabInput,
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
