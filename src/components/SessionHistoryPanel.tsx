import React from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Tooltip } from "./Tooltip";
import { formatBytes } from "./MemoryMeter";
import type { Workspace, Session, WindowData } from "../lib/schemas";

export interface SessionHistoryPanelProps {
  workspace: Workspace;
  sessions: Session[];
  expandedSessionId: string | null;
  sessionWindows: Record<string, WindowData[]>;
  onClose: () => void;
  onToggleExpand: (sessionId: string) => void;
  onRestoreSession: (sessionId: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

const HistoryPanelHeader: React.FC<{
  workspace: Workspace;
  sessionCount: number;
  onClose: () => void;
}> = ({ workspace, sessionCount, onClose }) => (
  <div className="flex items-center justify-between p-base border-b border-border-subtle bg-bg-surface">
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: workspace.color }}
      />
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-text-primary">
          {workspace.name} History
        </span>
        <span className="text-3xs font-mono text-text-disabled">
          {sessionCount} recorded snapshots
        </span>
      </div>
    </div>
    <Button size="sm" variant="ghost" iconOnly icon="close" onClick={onClose} aria-label="Close panel" />
  </div>
);

const SessionWindowItem: React.FC<{ win: WindowData }> = ({ win }) => (
  <div className="flex items-center justify-between py-1 px-2 text-3xs font-mono bg-bg-base/50 rounded border border-border-subtle/50">
    <div className="flex flex-col truncate max-w-[200px]">
      <span className="truncate text-text-primary font-medium">{win.title}</span>
      <span className="text-text-disabled">
        {win.process_name} • PID:{win.process_id}
      </span>
    </div>
    <span className="text-text-secondary">{formatBytes(win.ram_bytes)}</span>
  </div>
);

const SessionSummaryHeader: React.FC<{
  session: Session;
}> = ({ session }) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col truncate max-w-[180px]">
      <span className="text-xs font-medium text-text-primary truncate">
        {session.name}
      </span>
      <span className="text-3xs font-mono text-text-disabled">
        {new Date(session.created_at).toLocaleString()}
      </span>
    </div>

    <div className="flex items-center gap-1.5 font-mono">
      <Badge variant={session.is_frozen ? "frozen" : "neutral"} size="sm">
        {session.window_count} win
      </Badge>
      <span className="text-2xs text-text-secondary font-mono">
        {formatBytes(session.ram_saved_bytes)}
      </span>
    </div>
  </div>
);

const SessionActionFooter: React.FC<{
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRestore: () => void;
  onDelete: () => void;
}> = ({ isExpanded, onToggleExpand, onRestore, onDelete }) => (
  <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
    <button
      type="button"
      onClick={onToggleExpand}
      className="text-3xs font-mono text-text-secondary hover:text-text-primary"
    >
      {isExpanded ? "Hide windows" : "Inspect windows"}
    </button>

    <div className="flex items-center gap-1">
      <Tooltip content="Restore this snapshot" position="bottom">
        <Button size="sm" variant="primary" icon="restore" onClick={onRestore}>
          Restore
        </Button>
      </Tooltip>
      <Tooltip content="Delete snapshot" position="bottom">
        <Button size="sm" variant="ghost" iconOnly icon="trash" onClick={onDelete} className="hover:text-danger" />
      </Tooltip>
    </div>
  </div>
);

const SessionHistoryRow: React.FC<{
  session: Session;
  isExpanded: boolean;
  windows?: WindowData[];
  onToggleExpand: () => void;
  onRestore: () => void;
  onDelete: () => void;
}> = ({ session, isExpanded, windows, onToggleExpand, onRestore, onDelete }) => (
  <div className="flex flex-col p-2 bg-bg-surface border border-border-subtle rounded-sm gap-2">
    <SessionSummaryHeader session={session} />
    <SessionActionFooter
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      onRestore={onRestore}
      onDelete={onDelete}
    />
    {isExpanded && (
      <div className="flex flex-col gap-1 pt-1.5 border-t border-border-subtle/50 max-h-48 overflow-y-auto custom-scrollbar">
        {windows && windows.length > 0 ? (
          windows.map((w) => <SessionWindowItem key={w.id} win={w} />)
        ) : (
          <span className="text-3xs font-mono text-text-disabled p-1">
            No windows saved or still loading...
          </span>
        )}
      </div>
    )}
  </div>
);

export const SessionHistoryPanel: React.FC<SessionHistoryPanelProps> = ({
  workspace,
  sessions,
  expandedSessionId,
  sessionWindows,
  onClose,
  onToggleExpand,
  onRestoreSession,
  onDeleteSession,
}) => {
  return (
    <div
      className="fixed inset-y-0 right-0 w-80 bg-bg-elevated border-l border-border-subtle shadow-2xl z-40 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Workspace snapshot history"
    >
      <HistoryPanelHeader
        workspace={workspace}
        sessionCount={sessions.length}
        onClose={onClose}
      />

      <div className="flex-1 p-base overflow-y-auto custom-scrollbar flex flex-col gap-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-text-disabled font-mono text-2xs">
            <span>No snapshot history recorded for this workspace.</span>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionHistoryRow
              key={session.id}
              session={session}
              isExpanded={expandedSessionId === session.id}
              windows={sessionWindows[session.id]}
              onToggleExpand={() => onToggleExpand(session.id)}
              onRestore={() => onRestoreSession(session.id)}
              onDelete={() => onDeleteSession(session.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
