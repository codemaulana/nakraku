import type { IconName } from "../components/Icon";

const PROCESS_ICON_CACHE = new Map<string, IconName>();

export const resolveProcessIcon = (processName: string): IconName => {
  const lower = processName.toLowerCase();
  const cached = PROCESS_ICON_CACHE.get(lower);
  if (cached) {
    return cached;
  }

  let icon: IconName = "window";

  if (lower.includes("code") || lower.includes("devenv")) {
    icon = "cpu";
  } else if (
    lower.includes("chrome") ||
    lower.includes("edge") ||
    lower.includes("firefox") ||
    lower.includes("brave")
  ) {
    icon = "globe";
  } else if (
    lower.includes("cmd") ||
    lower.includes("powershell") ||
    lower.includes("terminal")
  ) {
    icon = "terminal";
  } else if (lower.includes("explorer")) {
    icon = "workspaces";
  } else if (lower.includes("settings")) {
    icon = "settings";
  }

  PROCESS_ICON_CACHE.set(lower, icon);
  return icon;
};
