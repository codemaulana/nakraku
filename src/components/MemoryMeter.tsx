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

const resolveSegmentColor = (segmentIndex: number, totalSegments: number, percent: number): string => {
  const threshold = (segmentIndex / totalSegments) * 100;
  if (threshold >= percent) {
    return "bg-white/[0.05] border-white/[0.03]";
  }
  if (threshold >= 85) {
    return "bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]";
  }
  if (threshold >= 65) {
    return "bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]";
  }
  return "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]";
};

const MemoryMeterHeader: React.FC<{
  usedBytes: number;
  totalBytes: number;
  percent: number;
}> = ({ usedBytes, totalBytes, percent }) => (
  <div className="flex items-center justify-between font-mono">
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
      <span className="text-2xs uppercase tracking-widest text-text-secondary font-bold font-display">
        RAM Telemetry
      </span>
      <span className="text-3xs px-1.5 py-0.5 rounded-xs bg-bg-elevated border border-border-subtle text-accent-emerald font-semibold">
        {percent}% LOAD
      </span>
    </div>
    <div className="flex items-center gap-2 text-2xs">
      <span className="text-text-primary font-medium tracking-tight">
        {formatBytes(usedBytes)} <span className="text-text-disabled">/</span> {formatBytes(totalBytes)}
      </span>
    </div>
  </div>
);

const MemoryMeterBar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="flex gap-1 w-full h-2.5 py-0.5">
    {Array.from({ length: TOTAL_SEGMENTS }).map((_, idx) => (
      <div
        key={idx}
        className={`flex-1 h-full rounded-2xs border transition-colors duration-200 ${resolveSegmentColor(
          idx,
          TOTAL_SEGMENTS,
          percent
        )}`}
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
      <span className="text-emerald-400/90 font-mono">&lt;35 MB Idle</span>
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
