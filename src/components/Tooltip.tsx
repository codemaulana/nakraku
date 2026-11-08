import React, { useId, useRef, useState, useEffect, useCallback } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  position?: TooltipPosition;
  delayMs?: number;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const resolvePositionClasses = (position: TooltipPosition): string => {
  switch (position) {
    case "bottom":
      return "top-full left-1/2 -translate-x-1/2 mt-1.5";
    case "left":
      return "right-full top-1/2 -translate-y-1/2 mr-1.5";
    case "right":
      return "left-full top-1/2 -translate-y-1/2 ml-1.5";
    case "top":
    default:
      return "bottom-full left-1/2 -translate-x-1/2 mb-1.5";
  }
};

const useTooltipState = (
  delayMs: number,
  disabled: boolean,
  hasContent: boolean
) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (disabled || !hasContent) {
      return;
    }
    clearTimer();
    timerRef.current = window.setTimeout(() => setIsOpen(true), delayMs);
  }, [disabled, hasContent, clearTimer, delayMs]);

  const hide = useCallback(() => {
    clearTimer();
    setIsOpen(false);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { isOpen, show, hide };
};

interface TooltipContentProps {
  id: string;
  content: React.ReactNode;
  shortcut?: string;
  position: TooltipPosition;
}

const TooltipContent: React.FC<TooltipContentProps> = ({
  id,
  content,
  shortcut,
  position,
}) => {
  const positionClass = resolvePositionClasses(position);

  return (
    <div
      id={id}
      role="tooltip"
      className={`absolute ${positionClass} z-50 pointer-events-none select-none whitespace-nowrap bg-bg-elevated border border-border-subtle shadow-md rounded-xs px-2 py-1 text-sm text-text-primary leading-tight flex items-center gap-1.5`}
    >
      <span>{content}</span>
      {shortcut && (
        <kbd className="px-1 py-0.5 bg-bg-surface border border-border-subtle rounded-xs font-mono text-2xs text-text-secondary">
          {shortcut}
        </kbd>
      )}
    </div>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  position = "top",
  delayMs = 200,
  disabled = false,
  children,
  className = "",
}) => {
  const id = useId();
  const hasContent = Boolean(content);
  const { isOpen, show, hide } = useTooltipState(delayMs, disabled, hasContent);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && isOpen) {
      hide();
    }
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={hide}
      onKeyDown={handleKeyDown}
      aria-describedby={isOpen ? id : undefined}
    >
      {children}
      {isOpen && (
        <TooltipContent
          id={id}
          content={content}
          shortcut={shortcut}
          position={position}
        />
      )}
    </div>
  );
};
