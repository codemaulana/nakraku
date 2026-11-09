import React, { useState, useEffect } from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Row } from "../components/Row";
import { Divider } from "../components/Divider";
import { Tooltip } from "../components/Tooltip";
import { AppIcon } from "../components/AppIcon";
import { useViewport } from "../context/ViewportContext";
import { useToast } from "../context/ToastContext";
import {
  getLiveWindows,
  minimizeWindow,
  restoreWindow,
  restoreWorkspace,
  stashNow,
} from "../lib/api";
import type { RawWindow } from "../lib/schemas";
import { Activity, Clock, ShieldCheck, Monitor } from "lucide-react";

interface SessionProcess {
  hwnd: string;
  name: string;
  title: string;
  ramUsage: string;
  ramBytes: number;
  status: "active" | "frozen";
}

const INITIAL_WINDOWS: SessionProcess[] = [
  { hwnd: "0x0014023A", name: "Code.exe", title: "Nakraku Stash - Visual Studio Code", ramUsage: "642 MB", ramBytes: 642 * 1024 * 1024, status: "active" },
  { hwnd: "0x000E011C", name: "chrome.exe", title: "Tauri v2 Documentation - Google Chrome", ramUsage: "812 MB", ramBytes: 812 * 1024 * 1024, status: "frozen" },
  { hwnd: "0x00080512", name: "WindowsTerminal.exe", title: "PowerShell - cargo check", ramUsage: "118 MB", ramBytes: 118 * 1024 * 1024, status: "active" },
  { hwnd: "0x002A093E", name: "Spotify.exe", title: "Spotify Premium", ramUsage: "284 MB", ramBytes: 284 * 1024 * 1024, status: "frozen" },
];

const mapRawToProcess = (w: RawWindow): SessionProcess => ({
  hwnd: w.hwnd,
  name: w.process_name,
  title: w.title || w.process_name,
  ramUsage: `${Math.round(w.ram_bytes / 1024 / 1024)} MB`,
  ramBytes: w.ram_bytes,
  status: w.is_minimized ? "frozen" : "active",
});

const ActiveSessionHeader: React.FC<{
  processCount: number;
  onSnapshot: () => void;
  onRestoreAll: () => void;
}> = ({ processCount, onSnapshot, onRestoreAll }) => (
  <div className="flex items-center justify-between h-row px-base bg-bg-surface/90 border-b border-border-hairline">
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono font-display">
        Active Session Orchestration
      </span>
      <Badge variant="active" dot pulse size="sm">LIVE ({processCount} Managed)</Badge>
    </div>
    <div className="flex items-center gap-2xs">
      <Tooltip content="Snapshot current state to SQLite" position="left">
        <Button size="sm" variant="secondary" icon="stash" onClick={onSnapshot}>Snapshot</Button>
      </Tooltip>
      <Tooltip content="Restore all stashed window coordinates" position="left">
        <Button size="sm" variant="primary" icon="restore" onClick={onRestoreAll}>Restore All</Button>
      </Tooltip>
    </div>
  </div>
);

const SessionStatsCard: React.FC<{ frozenRamMb: number; totalRamMb: number; uptime: number }> = ({
  frozenRamMb, totalRamMb, uptime,
}) => {
  const h = String(Math.floor(uptime / 3600)).padStart(2, "0");
  const m = String(Math.floor((uptime % 3600) / 60)).padStart(2, "0");
  const s = String(uptime % 60).padStart(2, "0");

  return (
    <div className="p-3 bg-bg-surface/90 border border-border-hairline rounded-sm flex items-center justify-between text-2xs text-text-secondary font-mono tactical-border shadow-sm">
      <span className="flex items-center gap-1.5">
        <Clock size={12} className="text-emerald-400" />
        <span>Session Uptime: {h}:{m}:{s}</span>
      </span>
      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
        <Activity size={12} />
        <span>Active RAM Frozen: {(frozenRamMb / 1024).toFixed(2)} GB</span>
      </span>
      <span className="text-text-disabled">Total Working Set: {(totalRamMb / 1024).toFixed(2)} GB</span>
    </div>
  );
};

const SessionWindowRow: React.FC<{
  proc: SessionProcess;
  onToggleStatus: (proc: SessionProcess) => void;
}> = ({ proc, onToggleStatus }) => (
  <Row
    key={proc.hwnd}
    size="md"
    icon={<AppIcon processName={proc.name} title={proc.title} size="sm" />}
    label={<span className="truncate text-text-primary font-medium tracking-tight">{proc.title}</span>}
    description={
      <span className="font-mono text-3xs text-text-disabled flex items-center gap-1.5">
        <span className="text-text-secondary font-semibold">{proc.name}</span>
        <span>•</span>
        <span className="px-1 py-0.2 rounded-2xs bg-bg-elevated border border-border-hairline text-accent-cyan font-mono text-3xs">
          {proc.hwnd}
        </span>
      </span>
    }
    meta={
      <div className="flex items-center gap-2 font-mono">
        <span className="text-2xs font-mono px-1.5 py-0.5 rounded-xs bg-bg-elevated border border-border-hairline text-text-primary font-semibold tabular-nums">
          {proc.ramUsage}
        </span>
        <button
          type="button"
          onClick={() => onToggleStatus(proc)}
          className="cursor-pointer transition-transform active:scale-95"
        >
          <Badge variant={proc.status === "frozen" ? "frozen" : "active"} dot size="sm">
            {proc.status.toUpperCase()}
          </Badge>
        </button>
      </div>
    }
  />
);

const SessionAsideInspector: React.FC<{ count: number }> = ({ count }) => (
  <aside className="w-80 shrink-0 border-l border-border-hairline bg-bg-surface/60 backdrop-blur-md p-sm flex flex-col gap-sm font-mono text-2xs select-none">
    <div className="flex items-center justify-between pb-xs border-b border-border-hairline uppercase tracking-wider text-text-secondary">
      <span className="font-bold text-text-primary font-display">Topology Inspector</span>
      <Badge variant="neutral" size="sm">Display Clamped</Badge>
    </div>
    <div className="flex flex-col gap-xs p-3 bg-bg-surface border border-border-hairline rounded-sm tactical-border shadow-xs">
      <span className="text-text-disabled flex items-center gap-1.5 font-semibold">
        <Monitor size={12} className="text-emerald-400" />
        <span>Multi-Monitor Alignment</span>
      </span>
      <div className="grid grid-cols-2 gap-xs pt-1.5">
        <div className="p-2 bg-bg-elevated/70 border border-emerald-500/20 rounded-xs flex flex-col gap-0.5">
          <span className="text-text-disabled text-[10px] uppercase font-bold">Display 1</span>
          <span className="text-text-primary font-semibold text-xs">1920 × 1080</span>
          <span className="text-accent-emerald text-[9px]">(0, 0) Primary</span>
        </div>
        <div className="p-2 bg-bg-elevated/70 border border-border-hairline rounded-xs flex flex-col gap-0.5">
          <span className="text-text-disabled text-[10px] uppercase font-bold">Display 2</span>
          <span className="text-text-primary font-semibold text-xs">1920 × 1080</span>
          <span className="text-text-disabled text-[9px]">(+1920, 0) Extended</span>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-xs p-3 bg-bg-surface border border-border-hairline rounded-sm tactical-border shadow-xs">
      <span className="text-text-disabled flex items-center gap-1.5 font-semibold">
        <ShieldCheck size={12} className="text-emerald-400" />
        <span>Subsystem Status</span>
      </span>
      <div className="flex flex-col gap-1.5 text-[11px] pt-1">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Hook Listener:</span>
          <span className="text-emerald-400 font-semibold">SetWinEventHook (Live)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Tracked HWNDs:</span>
          <span className="text-text-primary font-semibold font-mono">{count}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Auto-Prune:</span>
          <span className="text-text-disabled font-mono">30m Bounded</span>
        </div>
      </div>
    </div>
  </aside>
);

const useSessionActions = (
  windows: SessionProcess[],
  setWindows: React.Dispatch<React.SetStateAction<SessionProcess[]>>,
  showToast: (m: string, v: "info" | "success" | "error") => void
) => {
  const handleToggle = async (proc: SessionProcess) => {
    try {
      if (proc.status === "active") {
        await minimizeWindow(proc.hwnd);
        setWindows((prev) => prev.map((w) => (w.hwnd === proc.hwnd ? { ...w, status: "frozen" } : w)));
        showToast(`Minimized ${proc.name}`, "info");
      } else {
        await restoreWindow(proc.hwnd, false);
        setWindows((prev) => prev.map((w) => (w.hwnd === proc.hwnd ? { ...w, status: "active" } : w)));
        showToast(`Restored ${proc.name}`, "success");
      }
    } catch (err) {
      showToast(`Action failed: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  };

  const handleRestoreAll = async () => {
    try {
      const frozen = windows.filter((w) => w.status === "frozen");
      await Promise.all(frozen.map((w) => restoreWindow(w.hwnd, false).catch(() => {})));
      await restoreWorkspace("default").catch(() => {});
      setWindows((prev) => prev.map((w) => ({ ...w, status: "active" })));
      showToast("All stashed windows restored", "success");
    } catch (err) {
      showToast(`Restore failed: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  };

  const handleSnapshot = async () => {
    try {
      const res = await stashNow("default", `Session ${new Date().toLocaleTimeString()}`);
      const freedMb = Math.round(res.ram_saved_bytes / 1024 / 1024);
      showToast(`Snapshot created: ${res.window_count} windows, ${freedMb} MB RAM freed`, "success");
      const raw = await getLiveWindows().catch(() => null);
      if (raw && raw.length > 0) setWindows(raw.map(mapRawToProcess));
    } catch (err) {
      showToast(`Snapshot failed: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  };

  return { handleToggle, handleRestoreAll, handleSnapshot };
};

const useActiveSession = () => {
  const { showToast } = useToast();
  const [windows, setWindows] = useState<SessionProcess[]>(INITIAL_WINDOWS);
  const [uptime, setUptime] = useState(13335);

  useEffect(() => {
    let mounted = true;
    getLiveWindows()
      .then((raw) => {
        if (mounted && raw && raw.length > 0) setWindows(raw.map(mapRawToProcess));
      })
      .catch(() => {});
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const actions = useSessionActions(windows, setWindows, showToast);
  return { windows, uptime, ...actions };
};

export const ActiveSessionView: React.FC = () => {
  const { mode } = useViewport();
  const { windows, uptime, handleToggle, handleRestoreAll, handleSnapshot } = useActiveSession();

  const totalRamMb = Math.round(windows.reduce((acc, w) => acc + w.ramBytes, 0) / 1024 / 1024);
  const frozenRamMb = Math.round(
    windows.filter((w) => w.status === "frozen").reduce((acc, w) => acc + w.ramBytes, 0) / 1024 / 1024
  );

  return (
    <MainPanel
      header={
        <ActiveSessionHeader
          processCount={windows.length}
          onSnapshot={handleSnapshot}
          onRestoreAll={handleRestoreAll}
        />
      }
      aside={mode === "fullscreen" ? <SessionAsideInspector count={windows.length} /> : undefined}
    >
      <div className="p-base flex flex-col gap-sm">
        <SessionStatsCard frozenRamMb={frozenRamMb} totalRamMb={totalRamMb} uptime={uptime} />
        <Divider label="Active Window Hierarchy & Coordinates" labelAlign="left" spacing="none" />
        <div className="border border-border-hairline rounded-sm bg-bg-surface/90 overflow-hidden tactical-border shadow-sm">
          {windows.map((proc) => (
            <SessionWindowRow key={proc.hwnd} proc={proc} onToggleStatus={handleToggle} />
          ))}
        </div>
      </div>
    </MainPanel>
  );
};
