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
    <div className="flex flex-col gap-2 p-3 bg-bg-surface/90 border border-border-hairline rounded-sm tactical-border shadow-xs">
      <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
        <span className="flex items-center gap-1.5 font-bold">
          <Monitor size={12} className="text-emerald-400" />
          <span>Spatial Multi-Display Topology</span>
        </span>
        <Badge variant="neutral" size="sm">
          2 Displays
        </Badge>
      </div>

      <div className="relative w-full h-24 bg-bg-void/90 border border-border-muted rounded-xs overflow-hidden flex items-center justify-center p-1.5 gap-1.5 shadow-inner">
        <div className="relative flex-1 h-full bg-bg-elevated/60 border border-emerald-500/20 rounded-xs flex flex-col justify-between p-1.5">
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Display 1 (1080p)</span>
          <div className="flex flex-wrap gap-1">
            {visibleWindows.slice(0, 4).map((w) => (
              <div
                key={w.hwnd}
                className="h-4 px-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xs text-[8px] font-mono text-emerald-400 truncate max-w-[75px] font-semibold flex items-center"
                title={`${w.title} (${w.process_name})`}
              >
                {w.process_name}
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-1/3 h-full bg-bg-elevated/60 border border-border-hairline rounded-xs flex flex-col justify-between p-1.5">
          <span className="text-[9px] font-mono text-text-disabled font-bold uppercase">Display 2 (1080p)</span>
          <div className="flex flex-wrap gap-1">
            {visibleWindows.slice(4, 6).map((w) => (
              <div
                key={w.hwnd}
                className="h-4 px-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-xs text-[8px] font-mono text-cyan-400 truncate max-w-[55px] font-semibold flex items-center"
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
    <div className="flex flex-col gap-2 p-3 bg-bg-surface/90 border border-border-hairline rounded-sm font-mono text-2xs tactical-border shadow-xs">
      <div className="flex items-center justify-between text-text-secondary">
        <span className="flex items-center gap-1.5 font-bold">
          <Cpu size={12} className="text-emerald-400" />
          <span>Physical RAM Breakdown</span>
        </span>
        <span className="text-emerald-400 font-semibold px-1.5 py-0.2 rounded-2xs bg-emerald-500/10 border border-emerald-500/20">
          {stats.memory_load_percentage}% Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-xs">
        <div className="p-2 bg-bg-elevated/60 border border-border-hairline rounded-xs flex flex-col gap-0.5">
          <span className="text-text-disabled text-[10px] uppercase">Working Set</span>
          <span className="text-text-primary font-semibold text-xs tabular-nums">
            {formatBytes(stats.used_ram_bytes)}
          </span>
        </div>
        <div className="p-2 bg-bg-elevated/60 border border-border-hairline rounded-xs flex flex-col gap-0.5">
          <span className="text-text-disabled text-[10px] uppercase">Available</span>
          <span className="text-emerald-400 font-semibold text-xs tabular-nums">
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
  <div className="flex flex-col gap-2 p-3 bg-bg-surface/90 border border-border-hairline rounded-sm font-mono text-2xs tactical-border shadow-xs">
    <div className="flex items-center justify-between text-text-secondary">
      <span className="flex items-center gap-1.5 font-bold">
        <HardDrive size={12} className="text-emerald-400" />
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
  <aside className="w-80 shrink-0 border-l border-border-hairline bg-bg-surface/60 backdrop-blur-md p-sm flex flex-col gap-sm overflow-y-auto custom-scrollbar select-none">
    <div className="flex items-center justify-between pb-xs border-b border-border-hairline font-mono text-2xs uppercase tracking-wider text-text-secondary">
      <span className="font-bold text-text-primary font-display">Tactical Inspector</span>
      <Badge variant="active" size="sm">
        {windows.length} HWNDs
      </Badge>
    </div>

    <MonitorSchematic windows={windows} />
    <TelemetryBreakdownCard stats={memoryStats} />
    <QuickWorkspaceDock onStash={onQuickStashWorkspace} />
  </aside>
);
