import React, { useState } from "react";
import { Row } from "./Row";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { Kbd } from "./Kbd";
import {
  WORKSPACE_PRESET_COLORS,
  ReorderChevrons,
  WorkspaceColorButton,
} from "./WorkspaceColorPicker";
import type { Workspace } from "../lib/schemas";

export { WORKSPACE_PRESET_COLORS };

export interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  index: number;
  onRestore: (id: string) => void;
  onOpenHistory: (ws: Workspace) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (ws: Workspace) => void;
  onChangeColor: (id: string, color: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const WorkspaceCardIcon: React.FC<{
  workspace: Workspace;
  onChangeColor: (id: string, c: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}> = ({ workspace, onChangeColor, onMoveUp, onMoveDown }) => (
  <div className="flex items-center gap-1.5 relative">
    <ReorderChevrons onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
    <WorkspaceColorButton
      workspace={workspace}
      onChangeColor={onChangeColor}
    />
  </div>
);

const WorkspaceInlineEditor: React.FC<{
  initialName: string;
  onSave: (newName: string) => void;
  onCancel: () => void;
}> = ({ initialName, onSave, onCancel }) => {
  const [name, setName] = useState(initialName);

  return (
    <input
      type="text"
      value={name}
      autoFocus
      onChange={(e) => setName(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave(name);
        else if (e.key === "Escape") onCancel();
      }}
      onBlur={() => onSave(name)}
      className="bg-bg-base border border-accent-emerald text-text-primary text-xs px-1 py-0.5 rounded outline-none font-medium"
      aria-label="Edit workspace name"
    />
  );
};

const WorkspaceRestoreButton: React.FC<{
  workspaceId: string;
  isActive: boolean;
  shortcutHint: string;
  onRestore: (id: string) => void;
}> = ({ workspaceId, isActive, shortcutHint, onRestore }) => (
  <Tooltip content={`Restore workspace (${shortcutHint})`} position="bottom">
    <Button
      size="sm"
      variant={isActive ? "secondary" : "primary"}
      icon="restore"
      onClick={(e) => {
        e.stopPropagation();
        onRestore(workspaceId);
      }}
    >
      <span>{isActive ? "Active" : "Restore"}</span>
      <Kbd shortcut={shortcutHint} size="xs" variant="ghost" />
    </Button>
  </Tooltip>
);

const WorkspaceUtilityActions: React.FC<{
  workspace: Workspace;
  onOpenHistory: (ws: Workspace) => void;
  onStartRename: () => void;
  onDelete: (ws: Workspace) => void;
}> = ({ workspace, onOpenHistory, onStartRename, onDelete }) => (
  <div className="flex items-center gap-1">
    <Tooltip content="Session History" position="bottom">
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        icon="workspaces"
        onClick={(e) => {
          e.stopPropagation();
          onOpenHistory(workspace);
        }}
        aria-label="View session snapshots"
      />
    </Tooltip>

    <Tooltip content="Rename" position="bottom">
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        icon="search"
        onClick={(e) => {
          e.stopPropagation();
          onStartRename();
        }}
        aria-label="Rename workspace"
      />
    </Tooltip>

    <Tooltip content="Delete Workspace" position="bottom">
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        icon="trash"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(workspace);
        }}
        className="hover:text-danger"
        aria-label="Delete workspace"
      />
    </Tooltip>
  </div>
);

const WorkspaceActions: React.FC<{
  workspace: Workspace;
  isActive: boolean;
  shortcutHint: string;
  onRestore: (id: string) => void;
  onOpenHistory: (ws: Workspace) => void;
  onStartRename: () => void;
  onDelete: (ws: Workspace) => void;
}> = ({
  workspace,
  isActive,
  shortcutHint,
  onRestore,
  onOpenHistory,
  onStartRename,
  onDelete,
}) => (
  <div className="flex items-center gap-1">
    <WorkspaceRestoreButton
      workspaceId={workspace.id}
      isActive={isActive}
      shortcutHint={shortcutHint}
      onRestore={onRestore}
    />
    <WorkspaceUtilityActions
      workspace={workspace}
      onOpenHistory={onOpenHistory}
      onStartRename={onStartRename}
      onDelete={onDelete}
    />
  </div>
);

const WorkspaceLabelDisplay: React.FC<{
  workspace: Workspace;
  isEditing: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}> = ({ workspace, isEditing, onSave, onCancel }) => {
  if (isEditing) {
    return (
      <WorkspaceInlineEditor
        initialName={workspace.name}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }
  return (
    <span className="truncate text-text-primary font-medium">
      {workspace.name}
    </span>
  );
};

export const WorkspaceCard: React.FC<WorkspaceCardProps> = (props) => {
  const { workspace, isActive, index, onRestore, onOpenHistory, onRename, onDelete, onChangeColor, onMoveUp, onMoveDown } = props;
  const [isEditing, setIsEditing] = useState(false);
  const shortcutHint = `Alt+${index + 1}`;

  const handleSaveRename = async (newName: string) => {
    setIsEditing(false);
    if (newName.trim() && newName.trim() !== workspace.name) {
      await onRename(workspace.id, newName.trim());
    }
  };

  return (
    <Row
      key={workspace.id}
      size="lg"
      active={isActive}
      highlightOnHover
      onDoubleClick={() => setIsEditing(true)}
      icon={<WorkspaceCardIcon workspace={workspace} onChangeColor={onChangeColor} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />}
      label={<WorkspaceLabelDisplay workspace={workspace} isEditing={isEditing} onSave={handleSaveRename} onCancel={() => setIsEditing(false)} />}
      description={<span className="font-mono text-3xs text-text-disabled">Slot #{index + 1} • {new Date(workspace.updated_at).toLocaleDateString()}</span>}
      meta={<Badge variant={isActive ? "active" : "neutral"} size="sm">{isActive ? "ACTIVE" : "SAVED"}</Badge>}
      actions={<WorkspaceActions workspace={workspace} isActive={isActive} shortcutHint={shortcutHint} onRestore={onRestore} onOpenHistory={onOpenHistory} onStartRename={() => setIsEditing(true)} onDelete={onDelete} />}
    />
  );
};
