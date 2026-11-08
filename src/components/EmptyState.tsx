import React from "react";
import { Icon, type IconName } from "./Icon";
import { Kbd } from "./Kbd";

export type EmptyStatePreset =
  | "windows"
  | "workspaces"
  | "search"
  | "history"
  | "tabs";

export interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: IconName | React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  shortcut?: string;
  compact?: boolean;
  className?: string;
}

interface PresetData {
  icon: IconName;
  title: string;
  description: string;
}

const PRESETS: Record<EmptyStatePreset, PresetData> = {
  windows: {
    icon: "window",
    title: "No Windows Detected",
    description: "Launch desktop applications or refresh system window handles.",
  },
  workspaces: {
    icon: "workspaces",
    title: "No Saved Workspaces",
    description: "Stash your active window layout to capture an atomic session snapshot.",
  },
  search: {
    icon: "search",
    title: "No Matching Processes",
    description: "No running desktop window matches the search query or process ID.",
  },
  history: {
    icon: "restore",
    title: "No Session Snapshots",
    description: "Historical snapshots will appear here as you stash and restore sessions.",
  },
  tabs: {
    icon: "globe",
    title: "No Browser Tabs Connected",
    description: "Connect the browser companion extension on ws://127.0.0.1:48123.",
  },
};

const EmptyStateIcon: React.FC<{
  icon: IconName | React.ReactNode;
  compact?: boolean;
}> = ({ icon, compact }) => {
  const containerSize = compact ? "w-7 h-7" : "w-9 h-9";
  const iconPixel = compact ? 14 : 16;

  return (
    <div
      className={`flex items-center justify-center rounded-xs bg-bg-elevated border border-border-subtle text-text-secondary select-none ${containerSize}`}
      aria-hidden="true"
    >
      {typeof icon === "string" ? (
        <Icon name={icon as IconName} size={iconPixel} />
      ) : (
        icon
      )}
    </div>
  );
};

const resolvePresetData = (props: EmptyStateProps) => {
  const presetConfig = props.preset ? PRESETS[props.preset] : undefined;
  const icon = props.icon ?? presetConfig?.icon ?? "window";
  const title = props.title ?? presetConfig?.title ?? "No Items Available";
  const description =
    props.description ??
    presetConfig?.description ??
    "There are currently no items to display in this list.";
  return { icon, title, description };
};

export const EmptyState: React.FC<EmptyStateProps> = (props) => {
  const { compact = false, action, shortcut, className = "" } = props;
  const { icon, title, description } = resolvePresetData(props);
  const padClass = compact ? "py-6 px-4" : "py-10 px-6";
  const spacingClass = compact ? "gap-2" : "gap-3";

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center w-full select-none ${padClass} ${spacingClass} ${className}`}
    >
      <EmptyStateIcon icon={icon} compact={compact} />

      <div className="flex flex-col items-center max-w-sm">
        <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
          {title}
        </h4>
        <p className="text-2xs text-text-secondary mt-1 font-mono leading-normal">
          {description}
        </p>
      </div>

      {(action || shortcut) && (
        <div className="flex items-center gap-2 mt-1">
          {action}
          {shortcut && <Kbd shortcut={shortcut} size="xs" variant="elevated" />}
        </div>
      )}
    </div>
  );
};
