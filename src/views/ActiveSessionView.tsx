import React, { useState } from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Row } from "../components/Row";
import { Divider } from "../components/Divider";
import { Tooltip } from "../components/Tooltip";
import { useViewport } from "../context/ViewportContext";
import { Activity, Clock, ShieldCheck, Monitor } from "lucide-react";

interface SessionProcess {
  hwnd: string;
  name: string;
  title: string;
  ramUsage: string;
  status: "active" | "frozen";
}

const INITIAL_WINDOWS: SessionProcess[] = [
  {
    hwnd: "0x0014023A",
    name: "Code.exe",
    title: "Nakraku Stash - Visual Studio Code",
    ramUsage: "642 MB",
    status: "active",
  },
  {
    hwnd: "0x000E011C",
    name: "chrome.exe",
    title: "Tauri v2 Documentation - Google Chrome",
    ramUsage: "812 MB",
    status: "frozen",
  },
  {
    hwnd: "0x00080512",
    name: "WindowsTerminal.exe",
    title: "PowerShell - cargo check",
    ramUsage: "118 MB",
    status: "active",
  },
  {
    hwnd: "0x002A093E",
    name: "Spotify.exe",
    title: "Spotify Premium",
    ramUsage: "284 MB",
    status: "frozen",
  },
];

const ActiveSessionHeader: React.FC<{
  processCount: number;
  onSnapshot: () => void;
  onRestoreAll: () => void;
}> = ({ processCount, onSnapshot, onRestoreAll }) => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        Active Session Orchestration
      </span>
      <Badge variant="active" dot pulse size="sm">
        LIVE ({processCount} Managed)
      </Badge>
    </div>
    <div className="flex items-center gap-2xs">
      <Tooltip content="Snapshot current state to SQLite" position="left">
        <Button size="sm" variant="secondary" icon="stash" onClick={onSnapshot}>
          Snapshot
        </Button>
      </Tooltip>
      <Tooltip content="Restore all stashed window coordinates" position="left">
        <Button size="sm" variant="primary" icon="restore" onClick={onRestoreAll}>
          Restore All
        </Button>
      </Tooltip>
    </div>
  </div>
);

const SessionStatsCard: React.FC = () => (
  <div className="p-xs bg-bg-surface border border-border-hairline rounded-sm flex items-center justify-between text-2xs text-text-secondary font-mono tactical-border">
    <span className="flex items-center gap-1.5">
      <Clock size={12} className="text-accent-phosphor" />
      <span>Session Uptime: 03:42:15</span>
    </span>
    <span className="text-accent-phosphor font-semibold flex items-center gap-1">
      <Activity size={12} />
      <span>Active RAM Frozen: 1.09 GB</span>
    </span>
    <span className="text-text-disabled">Total Working Set: 1.85 GB</span>
  </div>
);

const SessionWindowRow: React.FC<{
  proc: SessionProcess;
  onToggleStatus: (hwnd: string) => void;
}> = ({ proc, onToggleStatus }) => (
  <Row
    key={proc.hwnd}
    size="md"
    icon={<span className="font-mono text-2xs text-text-disabled">{proc.hwnd}</span>}
    label={proc.title}
    description={`${proc.name} • ${proc.hwnd}`}
    meta={
      <div className="flex items-center gap-xs font-mono">
        <span className="text-2xs text-text-secondary">{proc.ramUsage}</span>
        <button
          type="button"
          onClick={() => onToggleStatus(proc.hwnd)}
          className="cursor-pointer"
        >
          <Badge
            variant={proc.status === "frozen" ? "frozen" : "active"}
            dot
            size="sm"
          >
            {proc.status.toUpperCase()}
          </Badge>
        </button>
      </div>
    }
  />
);

const SessionAsideInspector: React.FC<{ windows: SessionProcess[] }> = ({ windows }) => (
  <aside className="w-80 shrink-0 border-l border-border-subtle bg-bg-surface/50 p-sm flex flex-col gap-sm font-mono text-2xs select-none">
    <div className="flex items-center justify-between pb-xs border-b border-border-subtle uppercase tracking-wider text-text-secondary">
      <span className="font-semibold text-text-primary">Topology Inspector</span>
      <Badge variant="neutral" size="sm">
        Display Clamped
      </Badge>
    </div>

    <div className="flex flex-col gap-xs p-xs bg-bg-surface border border-border-hairline rounded-sm tactical-border">
      <span className="text-text-disabled flex items-center gap-1">
        <Monitor size={12} className="text-accent-phosphor" />
        <span>Multi-Monitor Coordinate Alignment</span>
      </span>
      <div className="grid grid-cols-2 gap-xs pt-1">
        <div className="p-xs bg-bg-elevated/70 border border-border-hairline rounded-xs flex flex-col">
          <span className="text-text-disabled text-[10px]">Primary Screen</span>
          <span className="text-text-primary font-semibold">1920 × 1080 (0,0)</span>
        </div>
        <div className="p-xs bg-bg-elevated/70 border border-border-hairline rounded-xs flex flex-col">
          <span className="text-text-disabled text-[10px]">Secondary Screen</span>
          <span className="text-text-primary font-semibold">1920 × 1080 (+1920)</span>
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-xs p-xs bg-bg-surface border border-border-hairline rounded-sm tactical-border">
      <span className="text-text-disabled flex items-center gap-1">
        <ShieldCheck size={12} className="text-accent-emerald" />
        <span>Subsystem Status</span>
      </span>
      <div className="flex flex-col gap-1 text-[11px] pt-1">
        <div className="flex justify-between">
          <span className="text-text-secondary">Hook Listener:</span>
          <span className="text-accent-phosphor">SetWinEventHook (Live)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Tracked HWNDs:</span>
          <span className="text-text-primary font-semibold">{windows.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Auto-Prune:</span>
          <span className="text-text-disabled">30m Bounded</span>
        </div>
      </div>
    </div>
  </aside>
);

export const ActiveSessionView: React.FC = () => {
  const { mode } = useViewport();
  const [windows, setWindows] = useState<SessionProcess[]>(INITIAL_WINDOWS);
  const isFullscreen = mode === "fullscreen";

  const handleToggle = (hwnd: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.hwnd === hwnd ? { ...w, status: w.status === "active" ? "frozen" : "active" } : w
      )
    );
  };

  return (
    <MainPanel
      header={
        <ActiveSessionHeader
          processCount={windows.length}
          onSnapshot={() => {}}
          onRestoreAll={() => {}}
        />
      }
      aside={isFullscreen ? <SessionAsideInspector windows={windows} /> : undefined}
    >
      <div className="p-base flex flex-col gap-sm">
        <SessionStatsCard />
        <Divider label="Active Window Hierarchy & Coordinates" labelAlign="left" spacing="none" />
        <div className="border border-border-hairline rounded-sm bg-bg-surface overflow-hidden tactical-border">
          {windows.map((proc) => (
            <SessionWindowRow
              key={proc.hwnd}
              proc={proc}
              onToggleStatus={handleToggle}
            />
          ))}
        </div>
      </div>
    </MainPanel>
  );
};
