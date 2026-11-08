import React from "react";
import { ScrollArea } from "./ScrollArea";

export interface MainPanelProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  header,
  children,
  aside,
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

      <div className="flex flex-1 overflow-hidden min-h-0">
        <ScrollArea
          scrollbarSize="thin"
          autoHide
          className={`flex-1 ${paddingClass} ${contentClassName}`}
        >
          {children}
        </ScrollArea>

        {aside}
      </div>

      {footer && (
        <footer className="shrink-0 border-t border-border-subtle bg-bg-surface select-none">
          {footer}
        </footer>
      )}
    </section>
  );
};
