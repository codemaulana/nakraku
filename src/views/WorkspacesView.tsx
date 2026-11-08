import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Tooltip } from "../components/Tooltip";
import { Divider } from "../components/Divider";
import { WorkspaceList, WorkspaceDeleteModal } from "../components/WorkspaceList";
import { WorkspaceCreatorBar } from "../components/WorkspaceCreatorBar";
import { SessionHistoryPanel } from "../components/SessionHistoryPanel";
import { useWorkspaces, type UseWorkspacesReturn } from "../hooks/useWorkspaces";

const WorkspacesHeader: React.FC<{
  count: number;
  isFreeTier: boolean;
  canCreate: boolean;
  onNewClick: () => void;
}> = ({ count, isFreeTier, canCreate, onNewClick }) => {
  const badgeLabel = isFreeTier ? `${count} / 3 Free Tier` : `${count} Workspaces (Pro)`;

  return (
    <div className="flex items-center justify-between h-row px-base">
      <div className="flex items-center gap-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
          Workspaces
        </span>
        <Badge variant={isFreeTier && count >= 3 ? "warning" : "neutral"} size="sm">
          {badgeLabel}
        </Badge>
      </div>

      {canCreate ? (
        <Button size="sm" variant="primary" icon="plus" onClick={onNewClick}>
          New Workspace
        </Button>
      ) : (
        <Tooltip content="Free tier limited to 3 workspaces. Upgrade to Pro for unlimited." position="left">
          <Button size="sm" variant="secondary" icon="plus" disabled>
            New Workspace
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

const WorkspacesStorageStatus: React.FC<{
  count: number;
  isFreeTier: boolean;
}> = ({ count, isFreeTier }) => (
  <div className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between text-2xs text-text-secondary font-mono">
    <span>Local SQLite Storage: {count} active workspace{count === 1 ? "" : "s"}</span>
    <span className={isFreeTier && count >= 3 ? "text-accent-amber font-semibold" : "text-accent-emerald font-semibold"}>
      {isFreeTier ? (count >= 3 ? "Free Limit Reached (3/3)" : `${3 - count} slot(s) remaining`) : "Pro License: Unlimited"}
    </span>
  </div>
);

const WorkspacesErrorBanner: React.FC<{
  error: string;
  onDismiss: () => void;
}> = ({ error, onDismiss }) => (
  <div className="p-2 bg-danger/10 border border-danger/40 rounded-sm flex items-center justify-between text-2xs text-danger font-mono">
    <span>{error}</span>
    <button type="button" onClick={onDismiss} className="hover:underline text-text-primary ml-2">
      Dismiss
    </button>
  </div>
);

const WorkspacesContent: React.FC<{
  w: UseWorkspacesReturn;
  canCreate: boolean;
}> = ({ w, canCreate }) => (
  <div className="p-base flex flex-col gap-sm relative min-h-full">
    {w.error && <WorkspacesErrorBanner error={w.error} onDismiss={w.clearError} />}

    <WorkspacesStorageStatus count={w.workspaces.length} isFreeTier={w.isFreeTier} />

    {w.isCreating && (
      <WorkspaceCreatorBar
        existingNames={w.workspaces.map((x) => x.name)}
        onSubmit={async (name, color) => await w.createWorkspace(name, color)}
        onCancel={() => w.setIsCreating(false)}
      />
    )}

    <Divider label="Saved Workspaces" labelAlign="left" spacing="none" />

    <WorkspaceList
      workspaces={w.workspaces}
      activeId={w.activeId}
      isFreeTier={w.isFreeTier}
      onRestore={w.restoreWorkspaceAction}
      onOpenHistory={w.openHistory}
      onRename={w.renameWorkspace}
      onDeleteRequest={w.setDeleteTarget}
      onChangeColor={w.changeColor}
      onMoveUp={(idx) => w.moveWorkspace(idx, "up")}
      onMoveDown={(idx) => w.moveWorkspace(idx, "down")}
      onCreateClick={canCreate ? () => w.setIsCreating(true) : undefined}
    />

    <WorkspaceDeleteModal
      target={w.deleteTarget}
      onConfirm={w.confirmDelete}
      onCancel={() => w.setDeleteTarget(null)}
    />

    {w.historyTarget && (
      <SessionHistoryPanel
        workspace={w.historyTarget}
        sessions={w.historySessions}
        expandedSessionId={w.expandedSessionId}
        sessionWindows={w.sessionWindows}
        onClose={w.closeHistory}
        onToggleExpand={w.toggleExpandSession}
        onRestoreSession={w.restoreSession}
        onDeleteSession={w.deleteSession}
      />
    )}
  </div>
);

export const WorkspacesView: React.FC = () => {
  const w = useWorkspaces();
  const canCreate = !w.isFreeTier || w.workspaces.length < 3;

  return (
    <MainPanel
      header={
        <WorkspacesHeader
          count={w.workspaces.length}
          isFreeTier={w.isFreeTier}
          canCreate={canCreate}
          onNewClick={() => w.setIsCreating(true)}
        />
      }
    >
      <WorkspacesContent w={w} canCreate={canCreate} />
    </MainPanel>
  );
};
