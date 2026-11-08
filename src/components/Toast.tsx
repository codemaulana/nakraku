import React, { useEffect } from "react";
import { Icon, type IconName } from "./Icon";

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs?: number;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<
  ToastVariant,
  { border: string; bg: string; text: string; icon: IconName }
> = {
  success: {
    border: "border-status-success/40",
    bg: "bg-status-success/10",
    text: "text-status-success",
    icon: "check",
  },
  warning: {
    border: "border-status-warning/40",
    bg: "bg-status-warning/10",
    text: "text-status-warning",
    icon: "alert",
  },
  error: {
    border: "border-status-danger/40",
    bg: "bg-status-danger/10",
    text: "text-status-danger",
    icon: "alert",
  },
  info: {
    border: "border-accent-cyan/40",
    bg: "bg-accent-cyan/10",
    text: "text-accent-cyan",
    icon: "info",
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, message, variant, durationMs = 4000 } = toast;
  const style = variantStyles[variant];

  useEffect(() => {
    if (durationMs <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(id);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [id, durationMs, onDismiss]);

  return (
    <div
      role="alert"
      className={`h-8 min-w-[240px] max-w-sm px-2.5 flex items-center justify-between gap-2 rounded-sm border shadow-md font-mono text-2xs backdrop-blur-sm bg-bg-surface ${style.border} ${style.bg}`}
    >
      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        <Icon name={style.icon} size="xs" className={style.text} />
        <span className="truncate text-text-primary">{message}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-text-muted hover:text-text-primary text-xs cursor-pointer p-0.5"
      >
        ×
      </button>
    </div>
  );
};
