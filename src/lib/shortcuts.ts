import { type AppRoute } from "./routes";

export type ShortcutCategory =
  | "navigation"
  | "stash"
  | "system"
  | "window";

export interface ShortcutItem {
  id: string;
  title: string;
  description: string;
  shortcut: string;
  category: ShortcutCategory;
  icon: string;
  route?: AppRoute;
  actionId?: string;
}

export const APP_SHORTCUTS: readonly ShortcutItem[] = [
  {
    id: "nav-dashboard",
    title: "Go to Dashboard",
    description: "Switch to live running windows view",
    shortcut: "Alt+1",
    category: "navigation",
    icon: "window",
    route: "dashboard",
  },
  {
    id: "nav-workspaces",
    title: "Go to Workspaces",
    description: "View and restore stashed workspaces",
    shortcut: "Alt+2",
    category: "navigation",
    icon: "workspaces",
    route: "workspaces",
  },
  {
    id: "nav-session",
    title: "Go to Active Session",
    description: "Inspect currently tracked processes and memory",
    shortcut: "Alt+3",
    category: "navigation",
    icon: "restore",
    route: "active-session",
  },
  {
    id: "nav-minimap",
    title: "Go to Spatial Minimap",
    description: "View multi-monitor spatial desktop layout",
    shortcut: "Alt+4",
    category: "navigation",
    icon: "minimap",
    route: "minimap",
  },
  {
    id: "nav-settings",
    title: "Go to Settings",
    description: "Configure system startup, hotkeys, and licensing",
    shortcut: "Alt+,",
    category: "navigation",
    icon: "settings",
    route: "settings",
  },
  {
    id: "nav-about",
    title: "Go to About",
    description: "View version, architecture, and license info",
    shortcut: "Alt+/",
    category: "navigation",
    icon: "info",
    route: "about",
  },
  {
    id: "nav-gallery",
    title: "Go to Component QA Gallery",
    description: "Developer design system visual workbench",
    shortcut: "Alt+G",
    category: "navigation",
    icon: "search",
    route: "gallery",
  },
  {
    id: "cmd-stash-all",
    title: "Stash All Windows",
    description: "Freeze and hibernate all active non-essential windows",
    shortcut: "Ctrl+S",
    category: "stash",
    icon: "stash",
    actionId: "stash-all",
  },
  {
    id: "cmd-global-stash",
    title: "Global New Stash",
    description: "Create a new stashed workspace snapshot",
    shortcut: "Ctrl+Shift+N",
    category: "stash",
    icon: "plus",
    actionId: "global-stash",
  },
  {
    id: "cmd-restore-last",
    title: "Restore Last Session",
    description: "Unfreeze and bring back previously stashed windows",
    shortcut: "Ctrl+Shift+R",
    category: "stash",
    icon: "restore",
    actionId: "restore-last",
  },
  {
    id: "cmd-filter",
    title: "Filter Windows",
    description: "Focus search bar to filter windows by PID or name",
    shortcut: "Ctrl+F",
    category: "window",
    icon: "search",
    actionId: "focus-search",
  },
  {
    id: "cmd-palette",
    title: "Command Palette",
    description: "Open command palette quick launcher",
    shortcut: "Ctrl+K",
    category: "system",
    icon: "search",
    actionId: "open-palette",
  },
  {
    id: "cmd-toggle-sidebar",
    title: "Toggle Sidebar",
    description: "Expand or collapse navigation sidebar",
    shortcut: "Ctrl+B",
    category: "window",
    icon: "window",
    actionId: "toggle-sidebar",
  },
] as const;

export const fuzzySearchCommands = (query: string): ShortcutItem[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return [...APP_SHORTCUTS];

  return APP_SHORTCUTS.filter(
    (item) =>
      item.title.toLowerCase().includes(clean) ||
      item.description.toLowerCase().includes(clean) ||
      item.shortcut.toLowerCase().includes(clean) ||
      item.category.toLowerCase().includes(clean)
  );
};
