import React, { useCallback, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import type { LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
import { Kbd } from "./Kbd";
import { ScrollArea } from "./ScrollArea";
import { getLiveWindows, listWorkspaces } from "../lib/api";
import {
  LayoutDashboard,
  Layers,
  History,
  Monitor,
  Settings,
  Info,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  shortcut?: string;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: "14", shortcut: "Alt+1" },
  { id: "workspaces", label: "Workspaces", icon: Layers, badge: "3", shortcut: "Alt+2" },
  { id: "active-session", label: "Active Session", icon: History, shortcut: "Alt+3" },
  { id: "minimap", label: "Spatial Minimap", icon: Monitor, shortcut: "Alt+4" },
  { id: "settings", label: "Settings", icon: Settings, shortcut: "Alt+," },
  { id: "about", label: "About", icon: Info, shortcut: "Alt+/" },
  { id: "gallery", label: "Component QA", icon: Sparkles, badge: "DEV", shortcut: "Alt+G" },
];

export interface SidebarProps {
  items?: NavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  isActive,
  collapsed,
  onClick,
}) => {
  const Icon = item.icon;

  const baseStyle =
    "flex items-center h-row w-full rounded-sm text-xs transition-colors select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald";
  const stateStyle = isActive
    ? "bg-accent-emerald-muted text-accent-emerald font-medium"
    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover";
  const paddingStyle = collapsed ? "justify-center px-0" : "px-sm gap-xs";

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? `${item.label} (${item.shortcut ?? ""})` : undefined}
      className={`${baseStyle} ${stateStyle} ${paddingStyle}`}
    >
      <Icon size={15} className="shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 text-left truncate">{item.label}</span>
          {item.badge !== undefined && (
            <Badge variant="count" size="sm">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );
};

interface SidebarNavListProps {
  items: NavItem[];
  activeId: string;
  collapsed: boolean;
  onSelect?: (id: string) => void;
}

const SidebarNavList: React.FC<SidebarNavListProps> = ({
  items,
  activeId,
  collapsed,
  onSelect,
}) => (
  <ScrollArea scrollbarSize="thin" autoHide className="flex-1 p-xs space-y-3xs">
    {!collapsed && (
      <div className="px-xs pt-xs pb-3xs text-2xs font-semibold tracking-wider text-text-disabled uppercase">
        Views
      </div>
    )}
    {items.map((item) => (
      <SidebarItem
        key={item.id}
        item={item}
        isActive={item.id === activeId}
        collapsed={collapsed}
        onClick={() => onSelect?.(item.id)}
      />
    ))}
  </ScrollArea>
);

interface SidebarFooterProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ collapsed, onToggle }) => (
  <div className="flex items-center justify-between p-xs border-t border-border-subtle">
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-center h-row w-full rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      {!collapsed && (
        <span className="flex-1 text-left ml-xs text-2xs text-text-disabled">
          Collapse
        </span>
      )}
      {!collapsed && <Kbd size="xs" variant="elevated" shortcut="Ctrl+B" />}
    </button>
  </div>
);

const useLiveNavItems = (baseItems: NavItem[]): NavItem[] => {
  const [counts, setCounts] = useState<{ windows: number; workspaces: number } | null>(null);

  useEffect(() => {
    if (!isTauri() || baseItems !== DEFAULT_NAV_ITEMS) return;
    let mounted = true;
    const syncCounts = () => {
      Promise.all([getLiveWindows().catch(() => null), listWorkspaces().catch(() => null)])
        .then(([wins, ws]) => {
          if (mounted && (wins || ws)) {
            setCounts((prev) => ({
              windows: wins ? wins.length : (prev?.windows ?? 14),
              workspaces: ws ? ws.length : (prev?.workspaces ?? 3),
            }));
          }
        })
        .catch(() => {});
    };
    syncCounts();
    const timer = setInterval(syncCounts, 4000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [baseItems]);

  if (!counts || baseItems !== DEFAULT_NAV_ITEMS) return baseItems;
  return baseItems.map((item) => {
    if (item.id === "dashboard") return { ...item, badge: String(counts.windows) };
    if (item.id === "workspaces") return { ...item, badge: String(counts.workspaces) };
    return item;
  });
};

export const Sidebar: React.FC<SidebarProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeId = "dashboard",
  onSelect,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const resolvedItems = useLiveNavItems(items);

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const toggleCollapse = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }, [onToggleCollapse]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  return (
    <aside
      className={`flex flex-col h-full bg-bg-surface border-r border-border-subtle transition-[width] duration-150 shrink-0 ${
        isCollapsed ? "w-sidebar-collapsed" : "w-sidebar"
      }`}
    >
      <SidebarNavList
        items={resolvedItems}
        activeId={activeId}
        collapsed={isCollapsed}
        onSelect={onSelect}
      />
      <SidebarFooter collapsed={isCollapsed} onToggle={toggleCollapse} />
    </aside>
  );
};
