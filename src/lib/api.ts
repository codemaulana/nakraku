import { invoke, isTauri } from "@tauri-apps/api/core";
import { z } from "zod";
import {
  WorkspaceSchema, CreateWorkspaceInputSchema,
  SessionSchema, CreateSessionInputSchema,
  WindowSchema, InsertWindowInputSchema,
  TabSchema, InsertTabInputSchema,
  type Workspace, type CreateWorkspaceInput,
  type Session, type CreateSessionInput,
  type WindowData, type InsertWindowInput,
  type TabData, type InsertTabInput,
} from "./schemas";

/**
 * Custom error class representing API and IPC transport failures.
 */
export class ApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Invokes a Tauri backend command safely with environment detection and error translation.
 * @template T Return type of the command.
 * @param {string} cmd Registered Tauri command name.
 * @param {Record<string, unknown>} [args] Command input arguments.
 * @returns {Promise<T>} Typed command response.
 * @throws {ApiError} If running outside Tauri or if command execution fails.
 */
export const safeInvoke = async <T>(
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

/**
 * Creates a new workspace in the local database.
 * @param {CreateWorkspaceInput} input Workspace configuration attributes.
 * @returns {Promise<Workspace>} Persisted workspace record.
 * @throws {ApiError} If input schema validation or database insertion fails.
 */
export const createWorkspace = async (
  input: CreateWorkspaceInput
): Promise<Workspace> => {
  const validatedInput = CreateWorkspaceInputSchema.parse(input);
  const raw = await safeInvoke<unknown>("create_workspace", { input: validatedInput });
  return WorkspaceSchema.parse(raw);
};

/**
 * Retrieves all stored workspaces ordered by their sort index.
 * @returns {Promise<Workspace[]>} Array of workspace objects.
 */
export const listWorkspaces = async (): Promise<Workspace[]> => {
  const raw = await safeInvoke<unknown>("list_workspaces");
  return z.array(WorkspaceSchema).parse(raw);
};

/**
 * Retrieves a single workspace record by its unique identifier.
 * @param {string} id Workspace UUID string.
 * @returns {Promise<Workspace>} Matching workspace record.
 * @throws {ApiError} If workspace is not found.
 */
export const getWorkspace = async (id: string): Promise<Workspace> => {
  const raw = await safeInvoke<unknown>("get_workspace", { id });
  return WorkspaceSchema.parse(raw);
};

/**
 * Renames an existing workspace.
 * @param {string} id Workspace UUID string.
 * @param {string} newName New workspace title (2 to 40 characters).
 * @returns {Promise<Workspace>} Updated workspace record.
 */
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

/**
 * Deletes a workspace and all cascaded session snapshots from the database.
 * @param {string} id Workspace UUID string.
 * @returns {Promise<boolean>} True if record was removed.
 */
export const deleteWorkspace = async (id: string): Promise<boolean> => {
  const raw = await safeInvoke<boolean>("delete_workspace", { id });
  return Boolean(raw);
};

/**
 * Persists the reordered sequence of workspace UUIDs.
 * @param {string[]} ids Array of workspace identifiers in desired display order.
 * @returns {Promise<void>}
 */
export const reorderWorkspaces = async (ids: string[]): Promise<void> => {
  await safeInvoke<void>("reorder_workspaces", { ids });
};

/**
 * Saves a new snapshot session record under a workspace.
 * @param {CreateSessionInput} input Session attributes and window counts.
 * @returns {Promise<Session>} Saved session record.
 */
export const saveSession = async (
  input: CreateSessionInput
): Promise<Session> => {
  const validatedInput = CreateSessionInputSchema.parse(input);
  const raw = await safeInvoke<unknown>("save_session", { input: validatedInput });
  return SessionSchema.parse(raw);
};

/**
 * Retrieves all historical sessions belonging to a specific workspace.
 * @param {string} workspaceId Target workspace UUID.
 * @returns {Promise<Session[]>} Array of session records.
 */
export const listSessions = async (workspaceId: string): Promise<Session[]> => {
  const raw = await safeInvoke<unknown>("list_sessions", { workspaceId });
  return z.array(SessionSchema).parse(raw);
};

/**
 * Retrieves a single session record by its unique identifier.
 * @param {string} id Session UUID string.
 * @returns {Promise<Session>} Matching session record.
 */
export const getSession = async (id: string): Promise<Session> => {
  const raw = await safeInvoke<unknown>("get_session", { id });
  return SessionSchema.parse(raw);
};

/**
 * Deletes an individual session record from the database.
 * @param {string} id Session UUID string.
 * @returns {Promise<boolean>} True if record was deleted.
 */
export const deleteSession = async (id: string): Promise<boolean> => {
  const raw = await safeInvoke<boolean>("delete_session", { id });
  return Boolean(raw);
};

/**
 * Persists window and browser tab entries associated with a saved session.
 * @param {InsertWindowInput[]} windows Window geometry objects.
 * @param {InsertTabInput[]} tabs Associated browser tab records.
 * @returns {Promise<void>}
 */
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

/**
 * Retrieves all saved window coordinates and titles for a session.
 * @param {string} sessionId Session UUID string.
 * @returns {Promise<WindowData[]>} Array of window data items.
 */
export const getSessionWindows = async (sessionId: string): Promise<WindowData[]> => {
  const raw = await safeInvoke<unknown>("get_session_windows", { sessionId });
  return z.array(WindowSchema).parse(raw);
};

/**
 * Retrieves browser tabs stashed under a specific window ID.
 * @param {string} windowId Window UUID string.
 * @returns {Promise<TabData[]>} Array of browser tab items.
 */
export const getWindowTabs = async (windowId: string): Promise<TabData[]> => {
  const raw = await safeInvoke<unknown>("get_window_tabs", { windowId });
  return z.array(TabSchema).parse(raw);
};

/**
 * Reads a preference value from the app_settings key-value store.
 * @param {string} key Preference identifier string.
 * @returns {Promise<string | null>} JSON serialized string or null if key does not exist.
 */
export const getSetting = async (key: string): Promise<string | null> => {
  const raw = await safeInvoke<string | null>("get_setting", { key });
  return raw ?? null;
};

/**
 * Writes a preference value to the app_settings key-value store.
 * @param {string} key Preference identifier string.
 * @param {string} value JSON stringified value to persist.
 * @returns {Promise<void>}
 */
export const setSetting = async (key: string, value: string): Promise<void> => {
  await safeInvoke<void>("set_setting", { key, value });
};

/**
 * Creates a file copy backup of stash.db to stash.db.bak.
 * @returns {Promise<string>} Filesystem path of the generated backup file.
 */
export const backupDatabase = async (): Promise<string> => {
  const raw = await safeInvoke<string>("backup_database");
  return String(raw);
};

/**
 * Retrieves the absolute path to the active SQLite database on disk.
 * @returns {Promise<string>} Canonical database filesystem path.
 */
export const getDatabasePath = async (): Promise<string> => {
  const raw = await safeInvoke<string>("get_database_path");
  return String(raw ?? "%APPDATA%\\com.nakraku.stash\\stash.db");
};

/**
 * Deletes all stored session snapshots and cascades window/tab entries across all workspaces.
 * @returns {Promise<number>} Count of purged sessions.
 */
export const purgeAllSessions = async (): Promise<number> => {
  const raw = await safeInvoke<number>("purge_all_sessions");
  return Number(raw ?? 0);
};

/**
 * Enables auto-start on Windows boot via the native autostart plugin.
 * @returns {Promise<void>}
 */
export const enableAutostart = async (): Promise<void> => {
  await safeInvoke<void>("plugin:autostart|enable");
};

/**
 * Disables auto-start on Windows boot.
 * @returns {Promise<void>}
 */
export const disableAutostart = async (): Promise<void> => {
  await safeInvoke<void>("plugin:autostart|disable");
};

/**
 * Queries whether auto-start on Windows boot is active.
 * @returns {Promise<boolean>}
 */
export const isAutostartEnabled = async (): Promise<boolean> => {
  return await safeInvoke<boolean>("plugin:autostart|is_enabled");
};

export * from "./osApi";
export * from "./wsApi";
export * from "./licenseApi";
export * from "./loggingApi";
