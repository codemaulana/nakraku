import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Row } from "../components/Row";
import { Tooltip } from "../components/Tooltip";
import { Divider } from "../components/Divider";

export interface WorkspaceItem {
  id: string;
  name: string;
  windowCount: number;
  ramSaved: string;
  color: string;
  updatedAt: string;
  isCurrent?: boolean;
}

const SAMPLE_WORKSPACES: WorkspaceItem[] = [
  {
    id: "ws-1",
    name: "Core Development",
    windowCount: 8,
    ramSaved: "1.4 GB",
    color: "#10B981",
    updatedAt: "2m ago",
    isCurrent: true,
  },
  {
    id: "ws-2",
    name: "Research & Literature",
    windowCount: 4,
    ramSaved: "850 MB",
    color: "#60A5FA",
    updatedAt: "1h ago",
  },
  {
    id: "ws-3",
    name: "Design & Specs",
    windowCount: 2,
    ramSaved: "420 MB",
    color: "#F59E0B",
    updatedAt: "Yesterday",
  },
];

const WorkspacesHeader: React.FC = () => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        Workspaces
      </span>
      <Badge variant="neutral" size="sm">
        3 / 3 Free Tier
      </Badge>
    </div>
    <Tooltip content="Maximum free tier reached (3/3)" position="left">
      <Button variant="secondary" size="sm" icon="plus" disabled>
        New Workspace
      </Button>
    </Tooltip>
  </div>
);

const WorkspaceTag: React.FC<{ color: string }> = ({ color }) => (
  <span
    className="w-2 h-2 rounded-full shrink-0"
    style={{ backgroundColor: color }}
  />
);

interface WorkspaceRowItemProps {
  ws: WorkspaceItem;
  onRestore: (id: string) => void;
}

const WorkspaceRowItem: React.FC<WorkspaceRowItemProps> = ({ ws, onRestore }) => (
  <Row
    key={ws.id}
    size="lg"
    active={ws.isCurrent}
    icon={<WorkspaceTag color={ws.color} />}
    label={ws.name}
    description={`${ws.windowCount} windows stashed • updated ${ws.updatedAt}`}
    meta={
      <div className="flex items-center gap-xs">
        <Badge variant={ws.isCurrent ? "active" : "frozen"} size="sm">
          {ws.ramSaved}
        </Badge>
      </div>
    }
    actions={
      <div className="flex items-center gap-2xs">
        <Button
          size="sm"
          variant={ws.isCurrent ? "secondary" : "primary"}
          icon="restore"
          onClick={() => onRestore(ws.id)}
        >
          {ws.isCurrent ? "Active" : "Restore"}
        </Button>
      </div>
    }
  />
);

export const WorkspacesView: React.FC = () => {
  const handleRestore = (id: string) => {
    void id;
  };

  return (
    <MainPanel header={<WorkspacesHeader />}>
      <div className="p-base flex flex-col gap-sm">
        <div className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between text-2xs text-text-secondary font-mono">
          <span>Local SQLite Storage: 3 active snapshots</span>
          <span className="text-accent-emerald font-semibold">Total RAM Stashed: 2.67 GB</span>
        </div>

        <Divider label="Saved Workspaces" labelAlign="left" spacing="none" />

        <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
          {SAMPLE_WORKSPACES.map((ws) => (
            <WorkspaceRowItem key={ws.id} ws={ws} onRestore={handleRestore} />
          ))}
        </div>
      </div>
    </MainPanel>
  );
};
