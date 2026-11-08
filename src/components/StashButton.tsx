import React from "react";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { formatBytes } from "./MemoryMeter";

export interface StashButtonProps {
  onStash: () => void;
  windowCount: number;
  estimatedRamBytes: number;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const StashButton: React.FC<StashButtonProps> = ({
  onStash,
  windowCount,
  estimatedRamBytes,
  loading = false,
  disabled = false,
  className = "",
}) => {
  const isActionDisabled = disabled || windowCount === 0 || loading;
  const tooltipText =
    windowCount > 0
      ? `${windowCount} windows will be stashed (~${formatBytes(
          estimatedRamBytes
        )} saved)`
      : "No open windows available to stash";

  return (
    <Tooltip content={tooltipText} shortcut="Ctrl+Shift+N" position="bottom">
      <Button
        variant="primary"
        size="lg"
        icon="stash"
        loading={loading}
        disabled={isActionDisabled}
        onClick={onStash}
        className={`font-mono tracking-tight ${className}`}
        aria-label={`Stash now: ${windowCount} windows`}
      >
        <span>Stash Now</span>
        {windowCount > 0 && (
          <span className="opacity-80 text-2xs px-1 py-0.5 rounded bg-bg-base/20 font-semibold">
            {windowCount}
          </span>
        )}
      </Button>
    </Tooltip>
  );
};
