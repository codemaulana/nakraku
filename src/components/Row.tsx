import React from "react";

export interface RowProps {
  id?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  active?: boolean;
  disabled?: boolean;
  highlightOnHover?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  tabIndex?: number;
  role?: string;
  "aria-label"?: string;
  "data-id"?: string;
}

const resolveRowHeight = (size: "sm" | "md" | "lg"): string => {
  switch (size) {
    case "sm":
      return "h-row-sm";
    case "lg":
      return "h-row-lg";
    case "md":
    default:
      return "h-row";
  }
};

const resolveRowInteractiveClasses = (
  selected: boolean,
  active: boolean,
  disabled: boolean,
  isClickable: boolean,
  highlightOnHover: boolean
): string => {
  if (disabled) {
    return "opacity-40 cursor-not-allowed pointer-events-none border-l-transparent";
  }
  const borderClass = selected
    ? "border-l-accent-emerald bg-bg-hover text-text-primary"
    : "border-l-transparent text-text-secondary";
  const hoverClass = highlightOnHover && !selected ? "hover:bg-bg-hover hover:text-text-primary" : "";
  const cursorClass = isClickable ? "cursor-pointer" : "cursor-default";
  const activeClass = active && !selected ? "text-accent-emerald" : "";
  return `${borderClass} ${hoverClass} ${cursorClass} ${activeClass}`;
};

const createKeyDownHandler = (
  disabled?: boolean,
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void,
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
) => {
  return (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && onClick) {
      event.preventDefault();
      event.currentTarget.click();
    }
    onKeyDown?.(event);
  };
};

interface RowContentProps {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const RowContent: React.FC<RowContentProps> = ({
  icon,
  label,
  description,
  meta,
  actions,
  children,
}) => {
  return (
    <>
      {icon && (
        <div className="flex items-center justify-center shrink-0 w-4 h-4 text-text-secondary group-hover:text-text-primary">
          {icon}
        </div>
      )}
      {children ? (
        <div className="min-w-0 flex-1 truncate">{children}</div>
      ) : (
        <div className="flex flex-col justify-center min-w-0 flex-1 leading-compact">
          <div className="truncate text-xs text-text-primary">{label}</div>
          {description && (
            <div className="truncate text-2xs text-text-secondary">{description}</div>
          )}
        </div>
      )}
      {meta && (
        <div className="flex items-center gap-2xs shrink-0 font-mono text-2xs text-text-secondary">
          {meta}
        </div>
      )}
      {actions && (
        <div className="flex items-center gap-3xs shrink-0">{actions}</div>
      )}
    </>
  );
};

export const Row: React.FC<RowProps> = ({
  id,
  size = "md",
  selected = false,
  active = false,
  disabled = false,
  highlightOnHover = true,
  className = "",
  onClick,
  onDoubleClick,
  onContextMenu,
  onKeyDown,
  tabIndex,
  role,
  "aria-label": ariaLabel,
  "data-id": dataId,
  ...contentProps
}) => {
  const isClickable = Boolean(onClick);
  const heightClass = resolveRowHeight(size);
  const stateClass = resolveRowInteractiveClasses(selected, active, disabled, isClickable, highlightOnHover);
  const handleKeyDown = createKeyDownHandler(disabled, onClick, onKeyDown);

  return (
    <div
      id={id}
      data-id={dataId}
      role={role ?? (isClickable ? "button" : "row")}
      tabIndex={disabled ? -1 : (tabIndex ?? (isClickable ? 0 : undefined))}
      aria-selected={selected}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onDoubleClick}
      onContextMenu={disabled ? undefined : onContextMenu}
      onKeyDown={handleKeyDown}
      className={`group flex items-center w-full px-sm gap-xs select-none border-l-2 transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus ${heightClass} ${stateClass} ${className}`}
    >
      <RowContent {...contentProps} />
    </div>
  );
};
