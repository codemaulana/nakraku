import { safeInvoke } from "./api";
import { z } from "zod";
import {
  SessionSnapshotSchema, RawWindowSchema,
  MemoryStatsSchema, StashResultSchema,
  RestoreResultSchema, QuickSwitchResultSchema,
  SessionDiffSchema, UndoItemSchema,
  WorkspaceSchema,
  type SessionSnapshot, type RawWindow,
  type MemoryStats, type StashResult,
  type RestoreResult, type QuickSwitchResult,
  type SessionDiff, type UndoItem,
  type Workspace,
} from "./schemas";

/**
 * Captures an instantaneous snapshot of all active Win32 windows and memory metrics.
 * @returns {Promise<SessionSnapshot>} Complete session snapshot payload.
 * @throws {ApiError} If Tauri IPC or Win32 enumeration fails.
 */
export const snapshotSession = async (): Promise<SessionSnapshot> => {
  const raw = await safeInvoke<unknown>("cmd_snapshot_session");
  return SessionSnapshotSchema.parse(raw);
};

/**
 * Retrieves the real-time list of un-cloaked, visible Win32 windows.
 * @returns {Promise<RawWindow[]>} Array of raw window items with HWND, PID, and rect bounds.
 * @throws {ApiError} If window enumeration fails.
 */
export const getLiveWindows = async (): Promise<RawWindow[]> => {
  const raw = await safeInvoke<unknown>("cmd_get_live_windows");
  return z.array(RawWindowSchema).parse(raw);
};

/**
 * Minimizes all active top-level user application windows immediately.
 * @returns {Promise<number>} Count of windows successfully minimized.
 * @throws {ApiError} If ShowWindow call fails.
 */
export const minimizeAllWindows = async (): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_minimize_all");
  return Number(raw);
};

/**
 * Retrieves system memory statistics including total RAM, used RAM, and per-process metrics.
 * @returns {Promise<MemoryStats>} System memory telemetry.
 * @throws {ApiError} If GlobalMemoryStatusEx query fails.
 */
export const getMemoryStats = async (): Promise<MemoryStats> => {
  const raw = await safeInvoke<unknown>("cmd_get_memory_stats");
  return MemoryStatsSchema.parse(raw);
};

/**
 * Minimizes a specific active Win32 window.
 * @param {string} hwnd Hexadecimal window handle string.
 * @returns {Promise<void>}
 */
export const minimizeWindow = async (hwnd: string): Promise<void> => {
  await safeInvoke<void>("cmd_minimize_window", { hwnd });
};

/**
 * Restores a specific minimized Win32 window to its prior active coordinate state.
 * @param {string} hwnd Hexadecimal window handle string.
 * @param {boolean} isMaximized Flag indicating whether window should be restored maximized.
 * @returns {Promise<void>}
 * @throws {ApiError} If SetWindowPlacement fails.
 */
export const restoreWindow = async (
  hwnd: string,
  isMaximized: boolean
): Promise<void> => {
  await safeInvoke<void>("cmd_restore_window", { hwnd, isMaximized });
};

/**
 * Restores all application windows associated with a stored session identifier.
 * @param {string} sessionId Unique UUID string of the session to restore.
 * @returns {Promise<number>} Count of windows successfully restored.
 * @throws {ApiError} If session restore operation fails.
 */
export const restoreSessionById = async (
  sessionId: string
): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_restore_session", { sessionId });
  return Number(raw);
};

/**
 * Executes a full workspace stash operation: snapshots windows, persists to DB, and minimizes windows.
 * @param {string} workspaceId Target workspace UUID.
 * @param {string} sessionName Human-readable snapshot session label.
 * @returns {Promise<StashResult>} Result summary including saved window count and freed RAM.
 * @throws {ApiError} If snapshot capture or DB insertion fails.
 */
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

/**
 * Restores the most recent snapshot session of the target workspace.
 * @param {string} workspaceId Target workspace UUID.
 * @returns {Promise<RestoreResult>} Result summary of restored windows and relaunch counts.
 * @throws {ApiError} If workspace restore fails.
 */
export const restoreWorkspace = async (
  workspaceId: string
): Promise<RestoreResult> => {
  const raw = await safeInvoke<unknown>("cmd_restore_workspace", {
    workspaceId,
  });
  return RestoreResultSchema.parse(raw);
};

/**
 * Stashes the current active workspace and restores the destination workspace in one operation.
 * @param {string} fromWorkspaceId Source workspace UUID to stash.
 * @param {string} toWorkspaceId Destination workspace UUID to restore.
 * @returns {Promise<QuickSwitchResult>} Combined stash and restore execution metrics.
 * @throws {ApiError} If quick switch fails.
 */
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

/**
 * Reverts the most recent stash or restore operation using the bounded undo stack.
 * @returns {Promise<UndoItem>} Details of the reverted operation.
 * @throws {ApiError} If undo stack is empty or reversion fails.
 */
export const undoLastOperation = async (): Promise<UndoItem> => {
  const raw = await safeInvoke<unknown>("cmd_undo_last_operation");
  return UndoItemSchema.parse(raw);
};

/**
 * Retrieves the current number of reversible operations on the undo stack.
 * @returns {Promise<number>} Count of undo entries (0 to 5).
 */
export const getUndoStackSize = async (): Promise<number> => {
  const raw = await safeInvoke<number>("cmd_get_undo_stack_size");
  return Number(raw);
};

/**
 * Validates and creates a new workspace enforcing name length and free-tier slot constraints.
 * @param {string} name Workspace label (2 to 40 characters).
 * @param {string} [color] Hex color string for badges and tags.
 * @param {string} [icon] Icon identifier string.
 * @returns {Promise<Workspace>} Created workspace record.
 * @throws {ApiError} If name is invalid or free tier limit (3 slots) is exceeded.
 */
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

/**
 * Computes a structural diff between live running windows and a stored session snapshot.
 * @param {string} sessionId Target session UUID.
 * @returns {Promise<SessionDiff>} Delta object containing added, removed, and moved windows.
 * @throws {ApiError} If session record cannot be found.
 */
export const diffLiveWithSession = async (
  sessionId: string
): Promise<SessionDiff> => {
  const raw = await safeInvoke<unknown>("cmd_diff_live_with_session", {
    sessionId,
  });
  return SessionDiffSchema.parse(raw);
};

/**
 * Triggers an automated background snapshot for the specified workspace.
 * @param {string} workspaceId Target workspace UUID.
 * @returns {Promise<string>} Generated session UUID.
 * @throws {ApiError} If auto snapshot fails.
 */
export const triggerAutoSnapshot = async (
  workspaceId: string
): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_trigger_auto_snapshot", {
    workspaceId,
  });
  return String(raw);
};
