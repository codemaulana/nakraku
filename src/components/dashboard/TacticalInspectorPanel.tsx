import React from "react";
import type { RawWindow, MemoryStats } from "../../lib/schemas";
import { formatBytes } from "../MemoryMeter";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Monitor, Cpu, HardDrive } from "lucide-react";

export interface TacticalInspectorPanelProps {
  windows: RawWindow[];
  memoryStats: MemoryStats | null;
  selectedCount: number;
  onQuickStashWorkspace?: (index: number) => void;
}

const MonitorSchematic: React.FC<{ windows: RawWindow[] }> = ({ windows }) => {
  const visibleWindows = windows.slice(0, 6);

  return (
    <div className="flex flex-col gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm">
      <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
        <span className="flex items-center gap-1">
          <Monitor size={12} className="text-accent-phosphor" />
          <span>Spatial Multi-Display Topology</span>
        </span>
        <Badge variant="neutral" size="sm">
          2 Displays Clamped
        </Badge>
      </div>

      <div className="relative w-full h-24 bg-bg-void/90 border border-border-muted rounded-xs overflow-hidden flex items-center justify-center p-1 gap-1">
        <div className="relative flex-1 h-full bg-bg-elevated/40 border border-border-subtle/60 rounded-xs flex flex-col justify-between p-1">
          <span className="text-[9px] font-mono text-text-disabled">Display 1 (1920×1080)</span>
          <div className="flex flex-wrap gap-0.5">
            {visibleWindows.slice(0, 4).map((w) => (
              <div
                key={w.hwnd}
                className="h-3.5 px-1 bg-accent-phosphor/15 border border-accent-phosphor/40 rounded-xs text-[8px] font-mono text-accent-phosphor truncate max-w-[70px]"
                title={`${w.title} (${w.process_name})`}
              >
                {w.process_name}
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-1/3 h-full bg-bg-elevated/40 border border-border-subtle/60 rounded-xs flex flex-col justify-between p-1">
          <span className="text-[9px] font-mono text-text-disabled">Display 2 (1080p)</span>
          <div className="flex flex-wrap gap-0.5">
            {visibleWindows.slice(4, 6).map((w) => (
              <div
                key={w.hwnd}
                className="h-3.5 px-1 bg-accent-cyan/15 border border-accent-cyan/40 rounded-xs text-[8px] font-mono text-accent-cyan truncate max-w-[50px]"
                title={`${w.title} (${w.process_name})`}
              >
                {w.process_name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TelemetryBreakdownCard: React.FC<{ stats: MemoryStats | null }> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
      <div className="flex items-center justify-between text-text-secondary">
        <span className="flex items-center gap-1">
          <Cpu size={12} className="text-accent-emerald" />
          <span>RAM Utilization</span>
        </span>
        <span className="text-text-primary font-semibold">
          {stats.memory_load_percentage}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-xs">
        <div className="p-xs bg-bg-elevated/60 border border-border-hairline rounded-xs flex flex-col">
          <span className="text-text-disabled text-[10px]">Physical Used</span>
          <span className="text-text-primary font-semibold text-xs">
            {formatBytes(stats.used_ram_bytes)}
          </span>
        </div>
        <div className="p-xs bg-bg-elevated/60 border border-border-hairline rounded-xs flex flex-col">
          <span className="text-text-disabled text-[10px]">Available</span>
          <span className="text-accent-emerald font-semibold text-xs">
            {formatBytes(stats.available_ram_bytes)}
          </span>
        </div>
      </div>
    </div>
  );
};

const QuickWorkspaceDock: React.FC<{
  onStash?: (index: number) => void;
}> = ({ onStash }) => (
  <div className="flex flex-col gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
    <div className="flex items-center justify-between text-text-secondary">
      <span className="flex items-center gap-1">
        <HardDrive size={12} className="text-accent-phosphor" />
        <span>Target Workspace Stash</span>
      </span>
      <Badge variant="neutral" size="sm">
        Slots 1-3
      </Badge>
    </div>

    <div className="grid grid-cols-3 gap-xs">
      {[1, 2, 3].map((slot) => (
        <Button
          key={slot}
          variant="secondary"
          size="sm"
          className="text-2xs font-mono justify-center"
          onClick={() => onStash?.(slot)}
        >
          Slot #{slot}
        </Button>
      ))}
    </div>
  </div>
);

export const TacticalInspectorPanel: React.FC<TacticalInspectorPanelProps> = ({
  windows,
  memoryStats,
  onQuickStashWorkspace,
}) => (
  <aside className="w-80 shrink-0 border-l border-border-subtle bg-bg-surface/40 p-sm flex flex-col gap-sm overflow-y-auto custom-scrollbar select-none">
    <div className="flex items-center justify-between pb-xs border-b border-border-subtle font-mono text-2xs uppercase tracking-wider text-text-secondary">
      <span className="font-semibold text-text-primary">Tactical Inspector</span>
      <Badge variant="active" size="sm">
        {windows.length} HWNDs
      </Badge>
    </div>

    <MonitorSchematic windows={windows} />
    <TelemetryBreakdownCard stats={memoryStats} />
    <QuickWorkspaceDock onStash={onQuickStashWorkspace} />
  </aside>
);
