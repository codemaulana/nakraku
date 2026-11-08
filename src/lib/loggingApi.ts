import { safeInvoke } from "./api";

export const getLogPath = async (): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_log_path");
  return String(raw || "");
};

export const getRecentLogs = async (maxLines = 100): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_recent_logs", { maxLines });
  return String(raw || "");
};
