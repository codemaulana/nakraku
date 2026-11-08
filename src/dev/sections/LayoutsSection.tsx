import React, { useState } from "react";
import { Row } from "../../components/Row";
import { Badge } from "../../components/Badge";
import { Icon } from "../../components/Icon";
import { Button } from "../../components/Button";
import { Divider } from "../../components/Divider";
import { SkeletonList } from "../../components/SkeletonRow";
import { EmptyState, type EmptyStatePreset } from "../../components/EmptyState";
import { ScrollArea } from "../../components/ScrollArea";

const RowsShowcase: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <span className="text-2xs font-mono text-text-secondary uppercase">
      Row Component (32px Desktop Density)
    </span>
    <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden divide-y divide-border-subtle/50">
      <Row
        icon={<Icon name="window" size="sm" className="text-accent-emerald" />}
        label="Active Window Row"
        description="Standard 32px height row with emerald selection bar"
        selected
        meta={<Badge variant="active" size="sm" dot>RUNNING</Badge>}
      />
      <Row
        icon={<Icon name="globe" size="sm" className="text-status-frozen" />}
        label="Frozen Process Row"
        description="PID 9424 — 624.1 MB RAM"
        meta={<span className="font-mono text-2xs text-text-disabled">624.1 MB</span>}
        actions={<Button size="sm" variant="ghost" icon="restore" iconOnly />}
      />
      <Row
        icon={<Icon name="terminal" size="sm" className="text-text-disabled" />}
        label="Disabled Window Row"
        description="System access restricted"
        disabled
      />
    </div>
  </div>
);

const EmptyStateShowcase: React.FC = () => {
  const [preset, setPreset] = useState<EmptyStatePreset>("windows");

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-mono text-text-secondary uppercase">
          EmptyState Presets
        </span>
        <div className="flex items-center gap-1">
          {(["windows", "workspaces", "search", "history", "tabs"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`px-1.5 py-0.5 rounded-xs font-mono text-2xs uppercase ${
                preset === p
                  ? "bg-accent-emerald text-bg-base font-semibold"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <EmptyState preset={preset} compact />
      </div>
    </div>
  );
};

const SkeletonsAndScrollShowcase: React.FC = () => (
  <div className="grid grid-cols-2 gap-base">
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        SkeletonList Loading State
      </span>
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <SkeletonList count={3} />
      </div>
    </div>
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Thin ScrollArea (4px Auto-Hide)
      </span>
      <ScrollArea
        scrollbarSize="thin"
        autoHide
        className="h-28 border border-border-subtle rounded-sm bg-bg-surface p-xs font-mono text-2xs text-text-secondary space-y-1"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="py-0.5 border-b border-border-subtle/30">
            Scrollable telemetry event #{i + 1}
          </div>
        ))}
      </ScrollArea>
    </div>
  </div>
);

export const LayoutsSection: React.FC = () => (
  <div className="flex flex-col gap-base">
    <RowsShowcase />
    <Divider spacing="none" />
    <EmptyStateShowcase />
    <Divider spacing="none" />
    <SkeletonsAndScrollShowcase />
  </div>
);
