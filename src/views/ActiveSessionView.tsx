import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Row } from "../components/Row";
import { Divider } from "../components/Divider";
import { Tooltip } from "../components/Tooltip";

interface SessionProcess {
  hwnd: string;
  name: string;
  title: string;
  ramUsage: string;
  status: "active" | "frozen";
}

const SESSION_WINDOWS: SessionProcess[] = [
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

const ActiveSessionHeader: React.FC = () => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        Active Session
      </span>
      <Badge variant="active" dot pulse size="sm">
        LIVE (4 Processes)
      </Badge>
    </div>
    <div className="flex items-center gap-2xs">
      <Tooltip content="Snapshot current state to SQLite" position="left">
        <Button size="sm" variant="secondary" icon="stash">
          Snapshot
        </Button>
      </Tooltip>
      <Tooltip content="Restore stashed windows" position="left">
        <Button size="sm" variant="primary" icon="restore">
          Restore All
        </Button>
      </Tooltip>
    </div>
  </div>
);

const SessionStatsCard: React.FC = () => (
  <div className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between text-2xs text-text-secondary font-mono">
    <span>Uptime: 03:42:15</span>
    <span className="text-accent-emerald font-semibold">Active RAM Saved: 1.09 GB (Frozen)</span>
    <span>Total Monitored: 1.85 GB</span>
  </div>
);

const SessionWindowRow: React.FC<{ proc: SessionProcess }> = ({ proc }) => (
  <Row
    key={proc.hwnd}
    size="md"
    icon={<span className="font-mono text-2xs text-text-disabled">{proc.hwnd}</span>}
    label={proc.title}
    description={`${proc.name} • ${proc.hwnd}`}
    meta={
      <div className="flex items-center gap-xs font-mono">
        <span className="text-2xs text-text-secondary">{proc.ramUsage}</span>
        <Badge
          variant={proc.status === "frozen" ? "frozen" : "active"}
          dot
          size="sm"
        >
          {proc.status.toUpperCase()}
        </Badge>
      </div>
    }
  />
);

export const ActiveSessionView: React.FC = () => {
  return (
    <MainPanel header={<ActiveSessionHeader />}>
      <div className="p-base flex flex-col gap-sm">
        <SessionStatsCard />
        <Divider label="Session Windows Hierarchy" labelAlign="left" spacing="none" />
        <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
          {SESSION_WINDOWS.map((proc) => (
            <SessionWindowRow key={proc.hwnd} proc={proc} />
          ))}
        </div>
      </div>
    </MainPanel>
  );
};
