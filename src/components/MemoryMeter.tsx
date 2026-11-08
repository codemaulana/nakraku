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

const resolveBarColor = (percent: number): string => {
  if (percent > 85) return "bg-danger";
  if (percent > 70) return "bg-warning";
  return "bg-accent-emerald";
};

const MemoryMeterLabels: React.FC<{
  usedBytes: number;
  totalBytes: number;
  percent: number;
}> = ({ usedBytes, totalBytes, percent }) => (
  <div className="flex items-center justify-between text-2xs font-mono">
    <span className="text-text-secondary uppercase tracking-wider font-semibold">
      Memory Meter
    </span>
    <div className="flex items-center gap-2">
      <span className="text-text-primary font-medium">
        {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
      </span>
      <span
        className={`font-semibold ${
          percent > 85
            ? "text-danger"
            : percent > 70
            ? "text-warning"
            : "text-accent-emerald"
        }`}
      >
        {percent}%
      </span>
    </div>
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

  const barColor = resolveBarColor(computedPercent);

  return (
    <div
      className={`flex flex-col gap-1 p-2 bg-bg-surface border border-border-subtle rounded-sm ${className}`}
      role="region"
      aria-label="System RAM usage meter"
    >
      <MemoryMeterLabels
        usedBytes={usedBytes}
        totalBytes={totalBytes}
        percent={computedPercent}
      />
      <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${computedPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-3xs font-mono text-text-disabled">
        <span>Free: {formatBytes(availableBytes)}</span>
        <span>Target: &lt;35 MB Idle</span>
      </div>
    </div>
  );
};
