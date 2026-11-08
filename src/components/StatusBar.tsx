import React, { useEffect, useState } from "react";

export interface StatusBarProps {
  ramUsage?: string;
  ramSaved?: string;
  processCount?: number;
  windowCount?: number;
  bridgeConnected?: boolean;
  bridgePort?: number;
  showClock?: boolean;
  viewportMode?: "compact" | "standard" | "fullscreen";
  className?: string;
}

const StatusBarClock: React.FC = () => {
  const [time, setTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span>{time}</span>;
};

interface BridgeIndicatorProps {
  connected: boolean;
  port: number;
}

const BridgeIndicator: React.FC<BridgeIndicatorProps> = ({ connected, port }) => (
  <div className="flex items-center gap-2xs" title={`WebSocket Bridge ws://127.0.0.1:${port}`}>
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        connected ? "bg-status-active" : "bg-status-warning"
      }`}
    />
    <span className={connected ? "text-accent-emerald" : "text-status-warning"}>
      WS:{port}
    </span>
  </div>
);

const StatusBarTelemetry: React.FC<{
  connected: boolean;
  port: number;
  processCount: number;
  windowCount: number;
  viewportMode?: string;
}> = ({ connected, port, processCount, windowCount, viewportMode }) => (
  <div className="flex items-center gap-xs">
    <BridgeIndicator connected={connected} port={port} />
    <span className="h-3 w-px bg-border-subtle" />
    <span>{processCount} PROCS</span>
    <span className="h-3 w-px bg-border-subtle" />
    <span>{windowCount} WINDOWS</span>
    {viewportMode && (
      <>
        <span className="h-3 w-px bg-border-subtle" />
        <span className="text-accent-phosphor font-semibold uppercase tracking-wider">
          [{viewportMode}]
        </span>
      </>
    )}
  </div>
);

const StatusBarMetrics: React.FC<{
  ramUsage: string;
  ramSaved?: string;
  showClock: boolean;
}> = ({ ramUsage, ramSaved, showClock }) => (
  <div className="flex items-center gap-xs">
    <span>RAM: <strong className="text-text-primary font-normal">{ramUsage}</strong></span>
    {ramSaved && (
      <>
        <span className="h-3 w-px bg-border-subtle" />
        <span className="text-accent-emerald">SAVED: {ramSaved}</span>
      </>
    )}
    {showClock && (
      <>
        <span className="h-3 w-px bg-border-subtle" />
        <StatusBarClock />
      </>
    )}
  </div>
);

export const StatusBar: React.FC<StatusBarProps> = ({
  ramUsage = "34.5 MB",
  ramSaved,
  processCount = 14,
  windowCount = 5,
  bridgeConnected = true,
  bridgePort = 48123,
  showClock = true,
  viewportMode,
  className = "",
}) => (
  <footer
    className={`flex items-center justify-between h-statusbar w-full bg-bg-surface border-t border-border-subtle px-sm text-2xs font-mono text-text-secondary select-none shrink-0 ${className}`}
  >
    <StatusBarTelemetry
      connected={bridgeConnected}
      port={bridgePort}
      processCount={processCount}
      windowCount={windowCount}
      viewportMode={viewportMode}
    />
    <StatusBarMetrics ramUsage={ramUsage} ramSaved={ramSaved} showClock={showClock} />
  </footer>
);
