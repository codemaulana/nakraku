import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Divider } from "../components/Divider";
import { useViewport } from "../context/ViewportContext";
import { Terminal, Shield, Database, Cpu, Layout, Radio } from "lucide-react";

const AboutHeader: React.FC = () => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        System Specification & Diagnostics
      </span>
      <Badge variant="active" size="sm">
        v0.1.0-RELEASE
      </Badge>
    </div>
    <div className="flex items-center gap-2xs font-mono text-2xs text-text-disabled">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-phosphor animate-pulse" />
      <span>OS KERNEL ACTIVE</span>
    </div>
  </div>
);

interface SpecMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

const SpecMetric: React.FC<SpecMetricProps> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center justify-between p-xs bg-bg-surface border border-border-hairline rounded-sm font-mono text-2xs tactical-border">
    <div className="flex items-center gap-1.5 text-text-secondary">
      {icon}
      <span>{label}</span>
    </div>
    <span className={`font-semibold ${highlight ? "text-accent-phosphor" : "text-text-primary"}`}>
      {value}
    </span>
  </div>
);

const TacticalHeroCard: React.FC = () => (
  <div className="p-base bg-bg-surface border border-border-hairline rounded-sm flex flex-col gap-xs tactical-border">
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-accent-phosphor tracking-wider font-mono">
          NAKRAKU STASH // TACTICAL UTILITY
        </span>
        <span className="text-2xs text-text-secondary font-mono">
          Zero-Cloud Desktop Workspace Orchestration & RAM-Freeze Subsystem
        </span>
      </div>
      <Badge variant="neutral" size="sm">
        MIT PERMISSIVE
      </Badge>
    </div>
    <Divider spacing="xs" />
    <p className="text-xs text-text-secondary leading-compact font-ui">
      Engineered for extreme performance, high window density, and instant recovery.
      Freeze memory-hungry IDEs, browsers, and terminals into local SQLite Write-Ahead Logging
      storage, and atomically resurrect multi-monitor coordinates in milliseconds.
    </p>
  </div>
);

const DiagnosticsGrid: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => (
  <div className="flex flex-col gap-xs">
    <Divider label="Native Architecture Invariants" labelAlign="left" spacing="none" />
    <div className={`grid gap-xs ${isFullscreen ? "grid-cols-3" : "grid-cols-2"}`}>
      <SpecMetric icon={<Terminal size={12} className="text-accent-phosphor" />} label="FFI Subsystem" value="Win32 windows-sys v0.59" highlight />
      <SpecMetric icon={<Cpu size={12} className="text-accent-cyan" />} label="Desktop Engine" value="Rust 1.99 + Tauri v2.12" />
      <SpecMetric icon={<Database size={12} className="text-accent-emerald" />} label="Local Storage" value="SQLite 3 (WAL + 256MB mmap)" />
      <SpecMetric icon={<Radio size={12} className="text-status-warning" />} label="Extension Bridge" value="ws://127.0.0.1:48123" />
      <SpecMetric icon={<Shield size={12} className="text-accent-phosphor" />} label="Offline Crypto" value="Ed25519 HWID-Keyring" highlight />
      <SpecMetric icon={<Layout size={12} className="text-accent-cyan" />} label="Design System" value="Tactical Monolith (32px)" />
    </div>
  </div>
);

const ExternalLinksBar: React.FC = () => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
    <div className="flex items-center gap-1.5 text-text-secondary">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-phosphor" />
      <span>Clean Architecture • Zero AI Slop Invariant</span>
    </div>
    <div className="flex items-center gap-xs">
      <Button
        size="sm"
        variant="secondary"
        icon="info"
        onClick={() => window.open("https://github.com/nakraku/stash", "_blank")}
      >
        Documentation
      </Button>
      <Button
        size="sm"
        variant="primary"
        icon="window"
        onClick={() => window.open("https://github.com/nakraku/stash", "_blank")}
      >
        GitHub Source
      </Button>
    </div>
  </div>
);

export const AboutView: React.FC = () => {
  const { mode } = useViewport();
  const isFullscreen = mode === "fullscreen";

  return (
    <MainPanel header={<AboutHeader />}>
      <div className="p-base flex flex-col gap-md">
        <TacticalHeroCard />
        <DiagnosticsGrid isFullscreen={isFullscreen} />
        <ExternalLinksBar />
      </div>
    </MainPanel>
  );
};
