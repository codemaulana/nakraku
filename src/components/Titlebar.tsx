import React from "react";
import { useWindowControls } from "../hooks/useWindowControls";

export interface TitlebarProps {
  title?: string;
  badge?: string;
  vibrant?: boolean;
  isMaximized?: boolean;
  updateAvailable?: {
    version: string;
    onClick?: () => void;
  };
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
      className="flex items-center justify-center w-[44px] h-full text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald focus-visible:z-10"
      aria-label="Minimize Window"
    >
      <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
        <line y1="0.5" x2="10" y2="0.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>

    <button
      type="button"
      onClick={onMaximize}
      className="flex items-center justify-center w-[44px] h-full text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald focus-visible:z-10"
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
      className="flex items-center justify-center w-[46px] h-full text-text-secondary hover:text-text-primary hover:bg-status-danger active:bg-[#DC2626] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald focus-visible:z-10"
      aria-label="Close Window"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  </div>
);

const TitlebarBrand: React.FC<{
  title: string;
  badge?: string;
  updateAvailable?: TitlebarProps["updateAvailable"];
}> = ({ title, badge, updateAvailable }) => (
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
    {updateAvailable ? (
      <button
        type="button"
        onClick={updateAvailable.onClick}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded text-2xs font-mono font-medium text-text-inverse bg-accent-emerald hover:bg-accent-emerald-bright active:scale-95 transition-all shadow-glow-emerald cursor-pointer"
        title={`Update to v${updateAvailable.version} available`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>v{updateAvailable.version} Available</span>
      </button>
    ) : null}
  </div>
);

export const Titlebar: React.FC<TitlebarProps> = ({
  title = "NAKRAKU STASH",
  badge,
  vibrant = true,
  isMaximized: controlledMaximized,
  updateAvailable,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  const controls = useWindowControls();

  const isMaximized = controlledMaximized ?? controls.isMaximized;
  const bgStyle = vibrant
    ? "bg-bg-surface-glass backdrop-blur-vibrant backdrop-saturate-150"
    : "bg-bg-surface";

  return (
    <header
      data-tauri-drag-region
      className={`flex items-center justify-between h-titlebar w-full border-b border-border-subtle select-none px-sm transition-colors ${bgStyle}`}
    >
      <TitlebarBrand title={title} badge={badge} updateAvailable={updateAvailable} />
      <div data-tauri-drag-region className="flex-1 h-full" />
      <WindowControls
        isMaximized={isMaximized}
        onMinimize={onMinimize ?? controls.minimize}
        onMaximize={onMaximize ?? controls.toggleMaximize}
        onClose={onClose ?? controls.close}
      />
    </header>
  );
};
