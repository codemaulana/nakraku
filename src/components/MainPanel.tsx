import React from "react";

export interface MainPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  header,
  children,
  footer,
  className = "",
  contentClassName = "",
  noPadding = false,
}) => {
  const paddingClass = noPadding ? "" : "p-base";

  return (
    <section
      className={`flex flex-col flex-1 h-full min-w-0 bg-bg-base overflow-hidden ${className}`}
    >
      {header && (
        <header className="shrink-0 border-b border-border-subtle bg-bg-surface select-none">
          {header}
        </header>
      )}

      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${paddingClass} ${contentClassName}`}
      >
        {children}
      </div>

      {footer && (
        <footer className="shrink-0 border-t border-border-subtle bg-bg-surface select-none">
          {footer}
        </footer>
      )}
    </section>
  );
};
