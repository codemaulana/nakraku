import type { BadgeVariant } from "../components/Badge";
import type { IconName } from "../components/Icon";
import type { ContextMenuItem } from "../components/ContextMenu";

export interface ProcessItem {
  id: string;
  title: string;
  desc: string;
  iconName: IconName;
  iconColor: string;
  pid: string;
  ram: string;
  status: BadgeVariant;
  statusText: string;
}

export const SAMPLE_PROCESSES: ProcessItem[] = [
  {
    id: "p1",
    title: "Visual Studio Code — nakraku",
    desc: "C:\\Nakraku\\src\\components\\Row.tsx",
    iconName: "window",
    iconColor: "text-accent-emerald",
    pid: "PID 18420",
    ram: "142.4 MB",
    status: "active",
    statusText: "RUNNING",
  },
  {
    id: "p2",
    title: "Google Chrome — GitHub PR #42",
    desc: "chrome.exe — 8 tabs active",
    iconName: "globe",
    iconColor: "text-status-frozen",
    pid: "PID 9424",
    ram: "624.1 MB",
    status: "frozen",
    statusText: "FROZEN",
  },
  {
    id: "p3",
    title: "Windows PowerShell — cargo check",
    desc: "powershell.exe — dev profile",
    iconName: "terminal",
    iconColor: "text-text-secondary",
    pid: "PID 3112",
    ram: "28.5 MB",
    status: "neutral",
    statusText: "IDLE",
  },
];

const createWorkspaceSubMenu = (onClose: () => void): ContextMenuItem[] => [
  { id: "ws-dev", label: "Dev Core (Active)", onClick: onClose },
  { id: "ws-ai", label: "Research & AI", onClick: onClose },
  { id: "ws-personal", label: "Personal", onClick: onClose },
];

export const createProcessMenuItems = (
  item: ProcessItem | null,
  onClose: () => void
): ContextMenuItem[] => [
  { id: "focus", label: "Focus Window", icon: "window", shortcut: "Enter", onClick: onClose },
  { id: "pin", label: "Pin to Workspace", icon: "pin", shortcut: "Alt+P", onClick: onClose },
  { id: "move-sub", label: "Move to Workspace", icon: "workspaces", subMenu: createWorkspaceSubMenu(onClose) },
  { id: "sep-1", separator: true },
  { id: "stash", label: "Stash Window", icon: "stash", shortcut: "Ctrl+S", onClick: onClose },
  { id: "copy", label: "Copy Process Info", icon: "copy", shortcut: "Ctrl+C", onClick: onClose },
  { id: "sep-2", separator: true },
  { id: "kill", label: `End Task (${item?.pid ?? "PID"})`, icon: "trash", danger: true, shortcut: "Del", onClick: onClose },
];
