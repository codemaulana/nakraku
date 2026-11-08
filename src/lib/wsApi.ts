import { safeInvoke } from "./api";
import { z } from "zod";
import {
  WsTabItemSchema, WsStatusPayloadSchema,
  type WsTabItem, type WsStatusPayload,
} from "./schemas";

/**
 * Queries the current connection and handshake status of the local WebSocket bridge.
 * @returns {Promise<WsStatusPayload>} Telemetry detailing port, connection state, and active client count.
 * @throws {ApiError} If IPC query fails.
 */
export const getWsStatus = async (): Promise<WsStatusPayload> => {
  const raw = await safeInvoke<unknown>("cmd_ws_get_status");
  return WsStatusPayloadSchema.parse(raw);
};

/**
 * Requests the list of open browser tabs from connected extension clients.
 * @returns {Promise<WsTabItem[]>} Array of active browser tab items.
 * @throws {ApiError} If extension is disconnected or command times out.
 */
export const getWsTabs = async (): Promise<WsTabItem[]> => {
  const raw = await safeInvoke<unknown>("cmd_ws_get_tabs");
  return z.array(WsTabItemSchema).parse(raw);
};

/**
 * Commands connected browser extensions to record all open tab URLs and close the tabs.
 * @returns {Promise<WsTabItem[]>} Array of closed tab items successfully stashed.
 * @throws {ApiError} If extension communication fails.
 */
export const stashWsTabs = async (): Promise<WsTabItem[]> => {
  const raw = await safeInvoke<unknown>("cmd_ws_stash_tabs");
  return z.array(WsTabItemSchema).parse(raw);
};

/**
 * Commands connected browser extensions to restore a list of URLs as open tabs.
 * @param {WsTabItem[]} tabs Array of tab objects specifying URLs and titles to open.
 * @returns {Promise<void>}
 * @throws {ApiError} If extension fails to reopen tabs.
 */
export const restoreWsTabs = async (tabs: WsTabItem[]): Promise<void> => {
  await safeInvoke<void>("cmd_ws_restore_tabs", { tabs });
};

/**
 * Retrieves the cached tab list from the most recent tab stash operation.
 * @returns {Promise<WsTabItem[]>} Array of last stashed browser tabs.
 */
export const getLastStashedWsTabs = async (): Promise<WsTabItem[]> => {
  const raw = await safeInvoke<unknown>("cmd_ws_get_last_stashed");
  return z.array(WsTabItemSchema).parse(raw);
};
