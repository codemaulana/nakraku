import React from "react";
import { WorkspaceCard } from "./WorkspaceCard";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";
import { EmptyState } from "./EmptyState";
import type { Workspace } from "../lib/schemas";

export interface WorkspaceListProps {
  workspaces: Workspace[];
  activeId: string | null;
  isFreeTier: boolean;
  onRestore: (id: string) => void;
  onOpenHistory: (ws: Workspace) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDeleteRequest: (ws: Workspace) => void;
  onChangeColor: (id: string, color: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onCreateClick?: () => void;
}

const FreeTierLockedSlot: React.FC = () => (
  <div className="flex items-center justify-between p-base bg-bg-surface/40 border border-dashed border-border-subtle rounded-sm opacity-60">
    <div className="flex items-center gap-2">
      <Icon name="lock" size="sm" className="text-text-disabled" />
      <span className="text-xs font-mono text-text-secondary">
        Slot #4 (Pro Tier)
      </span>
    </div>
    <Tooltip content="Upgrade to Pro for unlimited workspaces" position="left">
      <Badge variant="warning" size="sm">
        PRO UPGRADE
      </Badge>
    </Tooltip>
  </div>
);

export const WorkspaceDeleteModal: React.FC<{
  target: Workspace | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}> = ({ target, onConfirm, onCancel }) => {
  if (!target) return null;

  return (
    <Modal
      isOpen={Boolean(target)}
      onClose={onCancel}
      title="Delete Workspace Confirmation"
      size="sm"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs text-text-secondary leading-relaxed">
          Are you sure you want to delete workspace{" "}
          <strong className="text-text-primary font-semibold">
            {target.name}
          </strong>
          ? All its saved sessions and snapshot history will be permanently
          removed from local SQLite storage.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
          <Button size="sm" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="danger" icon="trash" onClick={onConfirm}>
            Delete Workspace
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const WorkspaceCardItems: React.FC<WorkspaceListProps> = ({
  workspaces,
  activeId,
  onRestore,
  onOpenHistory,
  onRename,
  onDeleteRequest,
  onChangeColor,
  onMoveUp,
  onMoveDown,
}) => (
  <div className="flex flex-col divide-y divide-border-subtle/50 border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
    {workspaces.map((ws, idx) => (
      <WorkspaceCard
        key={ws.id}
        workspace={ws}
        isActive={ws.id === activeId}
        index={idx}
        onRestore={onRestore}
        onOpenHistory={onOpenHistory}
        onRename={onRename}
        onDelete={onDeleteRequest}
        onChangeColor={onChangeColor}
        onMoveUp={idx > 0 ? () => onMoveUp(idx) : undefined}
        onMoveDown={
          idx < workspaces.length - 1 ? () => onMoveDown(idx) : undefined
        }
      />
    ))}
  </div>
);

export const WorkspaceList: React.FC<WorkspaceListProps> = (props) => {
  const { workspaces, isFreeTier, onCreateClick } = props;

  if (workspaces.length === 0) {
    return (
      <EmptyState
        preset="workspaces"
        action={
          onCreateClick ? (
            <Button size="sm" variant="primary" icon="search" onClick={onCreateClick}>
              Create Workspace
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <WorkspaceCardItems {...props} />
      {isFreeTier && workspaces.length >= 3 && <FreeTierLockedSlot />}
    </div>
  );
};
