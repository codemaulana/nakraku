import React, { useEffect, useState } from "react";

export interface StatusBarProps {
  ramUsage?: string;
  ramSaved?: string;
  processCount?: number;
  windowCount?: number;
  bridgeConnected?: boolean;
  bridgePort?: number;
  showClock?: boolean;
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

export const StatusBar: React.FC<StatusBarProps> = ({
  ramUsage = "34.5 MB",
  ramSaved,
  processCount = 14,
  windowCount = 5,
  bridgeConnected = true,
  bridgePort = 48123,
  showClock = true,
  className = "",
}) => {
  return (
    <footer
      className={`flex items-center justify-between h-statusbar w-full bg-bg-surface border-t border-border-subtle px-sm text-2xs font-mono text-text-secondary select-none shrink-0 ${className}`}
    >
      <div className="flex items-center gap-xs">
        <BridgeIndicator connected={bridgeConnected} port={bridgePort} />

        <span className="h-3 w-px bg-border-subtle" />

        <span>{processCount} PROCS</span>

        <span className="h-3 w-px bg-border-subtle" />

        <span>{windowCount} WINDOWS</span>
      </div>

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
    </footer>
  );
};
