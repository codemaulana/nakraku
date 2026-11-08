import React from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";

export interface DashboardEmptyStateProps {
  onRefresh: () => void;
  className?: string;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  onRefresh,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center p-base py-6 bg-bg-surface border border-border-subtle rounded-sm text-center gap-2 ${className}`}
    role="status"
    aria-label="No windows detected"
  >
    <div className="w-9 h-9 rounded-full bg-bg-elevated flex items-center justify-center text-text-secondary">
      <Icon name="window" size="md" />
    </div>
    <div className="flex flex-col gap-1 max-w-sm">
      <span className="text-xs font-semibold text-text-primary">
        No Active Windows Detected
      </span>
      <span className="text-2xs text-text-secondary font-mono leading-relaxed">
        All desktop applications may be minimized, cloaked on virtual desktops,
        or excluded by system filters.
      </span>
    </div>
    <Button variant="secondary" size="sm" icon="restore" onClick={onRefresh}>
      Refresh Scan
    </Button>
  </div>
);

export interface DashboardErrorStateProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  error,
  onRetry,
  className = "",
}) => (
  <div
    className={`flex flex-col p-3 bg-danger/10 border border-danger/30 rounded-sm gap-2 ${className}`}
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-center gap-2 text-danger text-xs font-semibold">
      <Icon name="alert" size="sm" />
      <span>Windows Subsystem Notice</span>
    </div>
    <p className="text-2xs font-mono text-text-secondary">{error}</p>
    <div className="flex items-center justify-between text-3xs font-mono text-text-disabled mt-1">
      <span>Admin apps require running Nakraku as Administrator</span>
      <Button variant="danger" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  </div>
);
