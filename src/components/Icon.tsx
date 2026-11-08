import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  Monitor,
  Settings,
  AppWindow,
  Terminal,
  Globe,
  Cpu,
  HardDrive,
  Sparkles,
  Archive,
  RotateCcw,
  Search,
  Filter,
  Pin,
  Trash2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  Check,
  AlertTriangle,
  Info,
  Lock,
  Key,
  Wifi,
  WifiOff,
  GripVertical,
  X,
} from "lucide-react";

export type IconSize = "xs" | "sm" | "md" | "lg" | number;

export type IconName =
  | "dashboard"
  | "workspaces"
  | "minimap"
  | "settings"
  | "window"
  | "terminal"
  | "globe"
  | "cpu"
  | "memory"
  | "sparkles"
  | "stash"
  | "restore"
  | "search"
  | "filter"
  | "pin"
  | "trash"
  | "copy"
  | "external-link"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "chevron-up"
  | "panel-left-close"
  | "panel-left-open"
  | "more-vertical"
  | "check"
  | "alert"
  | "info"
  | "lock"
  | "key"
  | "wifi"
  | "wifi-off"
  | "grip-vertical"
  | "close";

export const ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  workspaces: Layers,
  minimap: Monitor,
  settings: Settings,
  window: AppWindow,
  terminal: Terminal,
  globe: Globe,
  cpu: Cpu,
  memory: HardDrive,
  sparkles: Sparkles,
  stash: Archive,
  restore: RotateCcw,
  search: Search,
  filter: Filter,
  pin: Pin,
  trash: Trash2,
  copy: Copy,
  "external-link": ExternalLink,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "chevron-up": ChevronUp,
  "panel-left-close": PanelLeftClose,
  "panel-left-open": PanelLeftOpen,
  "more-vertical": MoreVertical,
  check: Check,
  alert: AlertTriangle,
  info: Info,
  lock: Lock,
  key: Key,
  wifi: Wifi,
  "wifi-off": WifiOff,
  "grip-vertical": GripVertical,
  close: X,
};

export interface IconProps {
  name: IconName;
  size?: IconSize;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
  title?: string;
}

export const resolveIconPixelSize = (size: IconSize): number => {
  if (typeof size === "number") {
    return size;
  }
  switch (size) {
    case "xs":
      return 12;
    case "md":
      return 16;
    case "lg":
      return 20;
    case "sm":
    default:
      return 14;
  }
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = "sm",
  strokeWidth = 1.5,
  className = "",
  "aria-label": ariaLabel,
  title,
}) => {
  const Component = ICON_MAP[name];
  const pixelSize = resolveIconPixelSize(size);
  const isAccessible = Boolean(ariaLabel || title);

  return (
    <Component
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={`shrink-0 select-none ${className}`}
      aria-hidden={isAccessible ? undefined : true}
      aria-label={ariaLabel}
      role={isAccessible ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
    </Component>
  );
};
