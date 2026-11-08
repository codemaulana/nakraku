import React from "react";

export type BadgeVariant =
  | "neutral"
  | "active"
  | "frozen"
  | "warning"
  | "danger"
  | "count"
  | "accent";

export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  pill?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

interface VariantStyles {
  container: string;
  dot: string;
}

const resolveBadgeVariantClasses = (variant: BadgeVariant): VariantStyles => {
  switch (variant) {
    case "active":
      return {
        container: "bg-status-active-muted text-status-active border-status-active/30",
        dot: "bg-status-active",
      };
    case "frozen":
      return {
        container: "bg-status-frozen-muted text-status-frozen border-status-frozen/30",
        dot: "bg-status-frozen",
      };
    case "warning":
      return {
        container: "bg-status-warning-muted text-status-warning border-status-warning/30",
        dot: "bg-status-warning",
      };
    case "danger":
      return {
        container: "bg-status-danger-muted text-status-danger border-status-danger/30",
        dot: "bg-status-danger",
      };
    case "accent":
      return {
        container: "bg-accent-emerald-muted text-accent-emerald border-accent-emerald/30",
        dot: "bg-accent-emerald",
      };
    case "count":
    case "neutral":
    default:
      return {
        container: "bg-bg-elevated text-text-secondary border-border-subtle",
        dot: "bg-text-secondary",
      };
  }
};

const resolveBadgeSizeClasses = (size: BadgeSize, isPill: boolean): string => {
  const radius = isPill ? "rounded-full" : "rounded-xs";
  if (size === "sm") {
    return `h-3.5 px-1 text-2xs ${radius}`;
  }
  return `h-[18px] px-1.5 text-2xs ${radius}`;
};

const BadgeDot: React.FC<{ colorClass: string; pulse?: boolean }> = ({
  colorClass,
  pulse = false,
}) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${colorClass} ${
      pulse ? "animate-pulse" : ""
    }`}
  />
);

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  pill,
  icon,
  children,
  className = "",
  title,
}) => {
  const isPill = pill ?? variant === "count";
  const styles = resolveBadgeVariantClasses(variant);
  const sizeClasses = resolveBadgeSizeClasses(size, isPill);

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 font-mono font-medium leading-none border select-none shrink-0 ${sizeClasses} ${styles.container} ${className}`}
    >
      {dot && <BadgeDot colorClass={styles.dot} pulse={pulse} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
