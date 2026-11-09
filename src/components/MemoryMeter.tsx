import React from "react";

export interface MemoryMeterProps {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  percentage?: number;
  className?: string;
}

export const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return "0 B";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
};

const TOTAL_SEGMENTS = 24;

const getSegmentStyle = (segmentIndex: number, totalSegments: number, percent: number): React.CSSProperties => {
  const threshold = (segmentIndex / totalSegments) * 100;
  if (threshold >= percent) {
    return {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
    };
  }
  if (threshold >= 85) {
    return {
      backgroundColor: "#EF4444",
      boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
      border: "1px solid #F87171",
    };
  }
  if (threshold >= 65) {
    return {
      backgroundColor: "#F59E0B",
      boxShadow: "0 0 8px rgba(245, 158, 11, 0.8)",
      border: "1px solid #FCD34D",
    };
  }
  return {
    backgroundColor: "#00F29E",
    boxShadow: "0 0 8px rgba(0, 242, 158, 0.8)",
    border: "1px solid #6EE7B7",
  };
};

const MemoryMeterHeader: React.FC<{
  usedBytes: number;
  totalBytes: number;
  percent: number;
}> = ({ usedBytes, totalBytes, percent }) => (
  <div className="flex items-center justify-between font-mono">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#00F29E] shadow-[0_0_8px_#00F29E] animate-pulse" />
      <span className="text-2xs uppercase tracking-widest text-text-secondary font-bold font-display">
        RAM Telemetry
      </span>
      <span className="text-3xs px-1.5 py-0.5 rounded-xs bg-bg-elevated border border-border-subtle text-accent-emerald font-semibold font-mono">
        {percent}% LOAD
      </span>
    </div>
    <div className="flex items-center gap-2 text-2xs font-mono">
      <span className="text-text-primary font-medium tracking-tight">
        {formatBytes(usedBytes)} <span className="text-text-disabled">/</span> {formatBytes(totalBytes)}
      </span>
    </div>
  </div>
);

const MemoryMeterBar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="flex gap-1 w-full h-3 my-0.5">
    {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => (
      <div
        key={idx}
        style={getSegmentStyle(idx, TOTAL_SEGMENTS, percent)}
        className="flex-1 h-full rounded-2xs transition-all duration-300"
      />
    ))}
  </div>
);

const MemoryMeterFooter: React.FC<{ availableBytes: number }> = ({ availableBytes }) => (
  <div className="flex items-center justify-between text-3xs font-mono text-text-disabled">
    <span className="flex items-center gap-1.5">
      <span className="text-text-secondary">Free:</span>
      <span className="text-text-primary font-semibold">{formatBytes(availableBytes)}</span>
    </span>
    <span className="flex items-center gap-1">
      <span>Target:</span>
      <span className="text-accent-emerald font-mono">&lt;35 MB Idle</span>
    </span>
  </div>
);

export const MemoryMeter: React.FC<MemoryMeterProps> = ({
  totalBytes,
  usedBytes,
  availableBytes,
  percentage,
  className = "",
}) => {
  const computedPercent =
    percentage === undefined
      ? totalBytes > 0
        ? Math.min(100, Math.round((usedBytes / totalBytes) * 100))
        : 0
      : percentage;

  return (
    <div
      className={`relative flex flex-col gap-2 p-3 bg-bg-surface/90 backdrop-blur-md border border-border-hairline rounded-sm shadow-sm ${className}`}
      role="region"
      aria-label="System RAM usage meter"
    >
      <MemoryMeterHeader usedBytes={usedBytes} totalBytes={totalBytes} percent={computedPercent} />
      <MemoryMeterBar percent={computedPercent} />
      <MemoryMeterFooter availableBytes={availableBytes} />
    </div>
  );
};
