import React from "react";
import { Divider } from "../Divider";
import { Button } from "../Button";
import type { AppSettings, AutoSnapshotInterval, RestoreConflictMode } from "../../lib/schemas";

interface StashBehaviorSectionProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const INTERVAL_OPTIONS: { label: string; value: AutoSnapshotInterval }[] = [
  { label: "Off", value: "off" },
  { label: "5 Min", value: "5m" },
  { label: "15 Min", value: "15m" },
  { label: "30 Min", value: "30m" },
];

const AutoSnapshotIntervalRow: React.FC<{
  current: AutoSnapshotInterval;
  onChange: (val: AutoSnapshotInterval) => void;
}> = ({ current, onChange }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-primary">Auto-Snapshot Interval</span>
      <span className="text-2xs text-text-secondary">Automatically snapshot active workspace periodically</span>
    </div>
    <div className="flex items-center gap-1">
      {INTERVAL_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-2 py-1 text-2xs font-mono rounded border transition-colors ${
            current === opt.value
              ? "bg-accent-emerald text-bg-base border-accent-emerald font-semibold"
              : "bg-bg-base text-text-secondary border-border-subtle hover:text-text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const ConflictModeRow: React.FC<{
  current: RestoreConflictMode;
  onChange: (val: RestoreConflictMode) => void;
}> = ({ current, onChange }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-primary">Restore Conflict Mode</span>
      <span className="text-2xs text-text-secondary">Behavior when restored process is already active</span>
    </div>
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange("overwrite")}
        className={`px-2 py-1 text-2xs font-mono rounded border transition-colors ${
          current === "overwrite"
            ? "bg-accent-emerald text-bg-base border-accent-emerald font-semibold"
            : "bg-bg-base text-text-secondary border-border-subtle hover:text-text-primary"
        }`}
      >
        Overwrite Pos
      </button>
      <button
        type="button"
        onClick={() => onChange("skip")}
        className={`px-2 py-1 text-2xs font-mono rounded border transition-colors ${
          current === "skip"
            ? "bg-accent-emerald text-bg-base border-accent-emerald font-semibold"
            : "bg-bg-base text-text-secondary border-border-subtle hover:text-text-primary"
        }`}
      >
        Skip Running
      </button>
    </div>
  </div>
);

export const StashBehaviorSection: React.FC<StashBehaviorSectionProps> = ({
  settings,
  onUpdate,
}) => (
  <div className="flex flex-col gap-xs">
    <Divider label="Stash & Snapshot Behavior" labelAlign="left" spacing="none" />
    <AutoSnapshotIntervalRow
      current={settings.auto_snapshot_interval}
      onChange={(val) => onUpdate("auto_snapshot_interval", val)}
    />
    <ConflictModeRow
      current={settings.restore_conflict_mode}
      onChange={(val) => onUpdate("restore_conflict_mode", val)}
    />
    <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-text-primary">Minimize Windows on Stash</span>
        <span className="text-2xs text-text-secondary">Batch minimize open windows when saving workspace session</span>
      </div>
      <Button
        size="sm"
        variant={settings.minimize_on_stash ? "primary" : "secondary"}
        onClick={() => onUpdate("minimize_on_stash", !settings.minimize_on_stash)}
      >
        {settings.minimize_on_stash ? "Enabled" : "Disabled"}
      </Button>
    </div>
  </div>
);
