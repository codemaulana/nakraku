import React from "react";
import { Badge } from "./Badge";

export interface ProcessCountProps {
  windowCount: number;
  processCount: number;
  selectedCount?: number;
  className?: string;
}

export const ProcessCount: React.FC<ProcessCountProps> = ({
  windowCount,
  processCount,
  selectedCount,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-2 text-2xs font-mono text-text-secondary ${className}`}
      aria-label="Tracked process and window metrics"
    >
      <div className="flex items-center gap-1.5">
        <Badge variant="count" size="sm">
          {windowCount}
        </Badge>
        <span>{windowCount === 1 ? "window" : "windows"}</span>
      </div>

      <span className="text-text-disabled">•</span>

      <div className="flex items-center gap-1.5">
        <Badge variant="neutral" size="sm">
          {processCount}
        </Badge>
        <span>{processCount === 1 ? "proc" : "procs"}</span>
      </div>

      {selectedCount !== undefined && selectedCount > 0 && (
        <>
          <span className="text-text-disabled">•</span>
          <div className="flex items-center gap-1.5">
            <Badge variant="accent" size="sm">
              {selectedCount}
            </Badge>
            <span className="text-accent-emerald">selected</span>
          </div>
        </>
      )}
    </div>
  );
};
