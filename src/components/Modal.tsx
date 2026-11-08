import React, { useEffect, useId, useRef } from "react";
import { Icon } from "./Icon";
import { ScrollArea } from "./ScrollArea";
import { useFocusTrap } from "../hooks/useFocusTrap";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
}

const resolveModalWidth = (size: ModalSize): string => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "md":
    default:
      return "max-w-md";
  }
};

const useEscapeDismiss = (
  isOpen: boolean,
  enabled: boolean,
  onDismiss: () => void
) => {
  useEffect(() => {
    if (!isOpen || !enabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, enabled, onDismiss]);
};

interface ModalHeaderProps {
  titleId: string;
  descId: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  titleId,
  descId,
  title,
  description,
  onClose,
}) => (
  <div className="flex items-start justify-between px-base py-sm border-b border-border-subtle bg-bg-surface shrink-0">
    <div className="flex flex-col gap-0.5 min-w-0 pr-sm">
      {title && (
        <h2 id={titleId} className="text-xs font-semibold text-text-primary tracking-tight truncate">
          {title}
        </h2>
      )}
      {description && (
        <p id={descId} className="text-2xs text-text-secondary leading-compact truncate">
          {description}
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className="p-1 rounded-xs text-text-disabled hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0"
    >
      <Icon name="close" size={13} />
    </button>
  </div>
);

const ModalBackdrop: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-bg-base/75 backdrop-blur-sm transition-opacity"
    onClick={onClick}
    aria-hidden="true"
  />
);

const ModalBodyAndFooter: React.FC<{
  children: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ children, footer }) => (
  <>
    <ScrollArea
      scrollbarSize="thin"
      autoHide
      className="p-base text-xs text-text-secondary leading-normal max-h-[70vh]"
    >
      {children}
    </ScrollArea>
    {footer && (
      <div className="flex items-center justify-end gap-xs px-base py-sm border-t border-border-subtle bg-bg-surface shrink-0">
        {footer}
      </div>
    )}
  </>
);

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocusRef,
  className = "",
}) => {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const widthClass = resolveModalWidth(size);
  const { handleKeyDown } = useFocusTrap(isOpen, dialogRef, initialFocusRef);

  useEscapeDismiss(isOpen, closeOnEscape, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-base select-none">
      <ModalBackdrop onClick={closeOnOverlayClick ? onClose : undefined} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className={`relative z-10 w-full ${widthClass} bg-bg-surface border border-border-subtle rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col ${className}`}
      >
        <ModalHeader
          titleId={titleId}
          descId={descId}
          title={title}
          description={description}
          onClose={onClose}
        />
        <ModalBodyAndFooter footer={footer}>{children}</ModalBodyAndFooter>
      </div>
    </div>
  );
};
