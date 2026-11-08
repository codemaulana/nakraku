import React, { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "./Badge";
import { Kbd } from "./Kbd";
import { ScrollArea } from "./ScrollArea";
import {
  LayoutDashboard,
  Layers,
  Monitor,
  Settings,
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
  { id: "minimap", label: "Spatial Minimap", icon: Monitor, shortcut: "Alt+3" },
  { id: "settings", label: "Settings", icon: Settings, shortcut: "Alt+," },
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
    "flex items-center h-row w-full rounded-sm text-xs transition-colors select-none";
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
      className="flex items-center justify-center h-row w-full rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
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

export const Sidebar: React.FC<SidebarProps> = ({
  items = DEFAULT_NAV_ITEMS,
  activeId = "dashboard",
  onSelect,
  collapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

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
        items={items}
        activeId={activeId}
        collapsed={isCollapsed}
        onSelect={onSelect}
      />
      <SidebarFooter collapsed={isCollapsed} onToggle={toggleCollapse} />
    </aside>
  );
};
