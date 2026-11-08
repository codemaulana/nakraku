import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";

const AboutHeader: React.FC = () => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        About Nakraku Stash
      </span>
      <Badge variant="active" size="sm">
        v0.1.0-alpha
      </Badge>
    </div>
  </div>
);

interface TechItemProps {
  label: string;
  value: string;
}

const TechItem: React.FC<TechItemProps> = ({ label, value }) => (
  <div className="flex items-center justify-between p-xs bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
    <span className="text-text-secondary">{label}</span>
    <span className="text-text-primary font-medium">{value}</span>
  </div>
);

const AppInfoCard: React.FC = () => (
  <div className="p-base bg-bg-surface border border-border-subtle rounded-sm flex flex-col gap-xs">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-accent-emerald tracking-wide">
          NAKRAKU STASH
        </span>
        <span className="text-2xs text-text-secondary">
          Open-Source High-Density Session Manager & RAM-Freeze Utility
        </span>
      </div>
      <Badge variant="neutral" size="sm">
        MIT LICENSE
      </Badge>
    </div>
    <Divider spacing="xs" />
    <p className="text-xs text-text-secondary leading-compact">
      Built for developers and power users who keep hundreds of tabs and heavy IDE windows open.
      Saves gigabytes of RAM by orchestrating OS-level freeze states and local WebSocket tab hibernation.
    </p>
  </div>
);

const DiagnosticsGrid: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <Divider label="Runtime Diagnostics & Architecture" labelAlign="left" spacing="none" />
    <div className="grid grid-cols-2 gap-xs">
      <TechItem label="Framework Core" value="Tauri v2.12.4" />
      <TechItem label="Engine Surface" value="Rust 1.99 + Win32 FFI" />
      <TechItem label="UI Presentation" value="React 18.3 + TypeScript" />
      <TechItem label="Database Engine" value="SQLite 3 (WAL Mode)" />
      <TechItem label="Architecture Target" value="x86_64 Windows 10/11" />
      <TechItem label="Memory Trim Engine" value="VirtualAlloc + WorkingSet" />
    </div>
  </div>
);

export const AboutView: React.FC = () => {
  return (
    <MainPanel header={<AboutHeader />}>
      <div className="p-base flex flex-col gap-md">
        <AppInfoCard />
        <DiagnosticsGrid />
        <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
          <span className="text-2xs text-text-secondary font-mono">
            Designed with FigCraft MCP Vector Canvas
          </span>
          <div className="flex items-center gap-xs">
            <Button size="sm" variant="secondary" icon="info">
              Release Notes
            </Button>
            <Button size="sm" variant="primary" icon="window">
              GitHub Repo
            </Button>
          </div>
        </div>
      </div>
    </MainPanel>
  );
};
