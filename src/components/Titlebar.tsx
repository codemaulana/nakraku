import React from "react";
import { useWindowControls } from "../hooks/useWindowControls";

export interface TitlebarProps {
  title?: string;
  badge?: string;
  isMaximized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

interface WindowControlsProps {
  isMaximized: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}) => (
  <div className="flex items-center h-full -mr-sm">
    <button
      type="button"
      onClick={onMinimize}
      className="flex items-center justify-center w-[44px] h-full text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active transition-colors"
      aria-label="Minimize Window"
    >
      <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
        <line y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>

    <button
      type="button"
      onClick={onMaximize}
      className="flex items-center justify-center w-[44px] h-full text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active transition-colors"
      aria-label={isMaximized ? "Restore Window" : "Maximize Window"}
    >
      {isMaximized ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 0.5H9.5V7.5M0.5 2.5H7.5V9.5H0.5V2.5Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
        </svg>
      )}
    </button>

    <button
      type="button"
      onClick={onClose}
      className="flex items-center justify-center w-[46px] h-full text-text-secondary hover:text-text-primary hover:bg-status-danger active:bg-[#DC2626] transition-colors"
      aria-label="Close Window"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  </div>
);

export const Titlebar: React.FC<TitlebarProps> = ({
  title = "NAKRAKU STASH",
  badge,
  isMaximized: controlledMaximized,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  const controls = useWindowControls();

  const isMaximized = controlledMaximized ?? controls.isMaximized;
  const handleMinimize = onMinimize ?? controls.minimize;
  const handleMaximize = onMaximize ?? controls.toggleMaximize;
  const handleClose = onClose ?? controls.close;

  return (
    <header
      data-tauri-drag-region
      className="flex items-center justify-between h-titlebar w-full bg-bg-surface border-b border-border-subtle select-none px-sm"
    >
      <div data-tauri-drag-region className="flex items-center gap-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-status-active" />
        <span className="text-xs font-bold tracking-wide text-text-primary">
          {title}
        </span>
        {badge ? (
          <span className="text-2xs font-mono text-text-secondary bg-bg-elevated px-1.5 py-0.5 rounded-xs border border-border-subtle">
            {badge}
          </span>
        ) : null}
      </div>

      <div data-tauri-drag-region className="flex-1 h-full" />

      <WindowControls
        isMaximized={isMaximized}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
    </header>
  );
};
