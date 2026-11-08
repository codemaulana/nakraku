import React from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface UpgradePromptProps {
  currentCount?: number;
  maxFreeCount?: number;
  onOpenActivation?: () => void;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentCount = 3,
  maxFreeCount = 3,
  onOpenActivation,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between p-sm bg-bg-surface border border-accent-emerald/30 rounded-sm text-2xs select-none ${className}`}
      role="region"
      aria-label="Pro Upgrade Banner"
    >
      <div className="flex items-center gap-sm">
        <Badge variant="warning" size="sm">
          {currentCount} / {maxFreeCount} SLOTS
        </Badge>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-text-primary">
            Free Tier Limit Reached
          </span>
          <span className="text-text-secondary text-2xs">
            Unlock unlimited workspaces and spatial monitor memory freeze with Nakraku Pro
          </span>
        </div>
      </div>

      <div className="flex items-center gap-xs">
        <Button size="sm" variant="primary" onClick={onOpenActivation}>
          Activate License
        </Button>
      </div>
    </div>
  );
};
