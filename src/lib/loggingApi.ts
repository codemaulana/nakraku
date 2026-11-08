import { safeInvoke } from "./api";

/**
 * Retrieves the absolute filesystem path to the rolling application log file.
 * @returns {Promise<string>} Canonical path to app.log.
 */
export const getLogPath = async (): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_log_path");
  return String(raw || "");
};

/**
 * Reads recent log lines from the rolling log file.
 * @param {number} [maxLines=100] Maximum count of recent log lines to retrieve.
 * @returns {Promise<string>} UTF-8 log contents.
 */
export const getRecentLogs = async (maxLines = 100): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_recent_logs", { maxLines });
  return String(raw || "");
};
