import React from "react";
import { MainPanel } from "./MainPanel";
import { Badge } from "./Badge";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { Input } from "./Input";
import { Kbd } from "./Kbd";
import { Spinner } from "./Spinner";
import { SkeletonList } from "./SkeletonRow";
import { EmptyState } from "./EmptyState";
import { Divider } from "./Divider";
import { ProcessList } from "./ProcessList";
import {
  SAMPLE_PROCESSES,
  type ProcessItem,
} from "../data/sampleProcesses";

interface ActionToolbarProps {
  onOpenStashModal: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onOpenStashModal,
  isLoading,
  onRefresh,
}) => (
  <div className="flex items-center gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm">
    <Tooltip content="Stash All Windows" shortcut="Ctrl+S" position="bottom">
      <Button variant="primary" icon="stash" onClick={onOpenStashModal}>
        Stash Now
      </Button>
    </Tooltip>

    <Tooltip content="Scan Desktop Windows" shortcut="Ctrl+R" position="bottom">
      <Button
        variant="secondary"
        icon={isLoading ? undefined : "restore"}
        loading={isLoading}
        onClick={onRefresh}
      >
        Scan
      </Button>
    </Tooltip>

    <Divider orientation="vertical" spacing="xs" className="h-5 my-auto" />

    <Tooltip content="Emergency purge" position="bottom">
      <Button variant="danger" icon="trash">
        Purge
      </Button>
    </Tooltip>
  </div>
);

const MainPanelHeader: React.FC<{ activeTab: string }> = ({ activeTab }) => (
  <div className="flex items-center justify-between h-row px-base">
    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
      {activeTab}
    </span>
    <Tooltip content="System IPC healthy (48123)" position="left">
      <Badge variant="active" dot pulse size="sm">
        SYSTEM OK
      </Badge>
    </Tooltip>
  </div>
);

const TaskStatusHeader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
      <div className="flex items-center gap-1.5">
        <span>Task 2.27: Keyboard Navigation Audit</span>
        {isLoading && <Spinner size="xs" variant="accent" />}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-text-disabled">Keys:</span>
        <Kbd shortcut="Ctrl+B" size="xs" variant="elevated" />
        <Kbd shortcut="Ctrl+K" size="xs" variant="default" splitKeys />
      </div>
    </div>
    <Divider label="Active Processes" labelAlign="left" spacing="none" />
  </div>
);

interface TableContainerProps {
  isLoading: boolean;
  filtered: ProcessItem[];
  selectedId: string;
  onClearFilter: () => void;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, item: ProcessItem) => void;
}

const ProcessTableContainer: React.FC<TableContainerProps> = ({
  isLoading,
  filtered,
  selectedId,
  onClearFilter,
  onSelect,
  onContextMenu,
}) => {
  if (isLoading) {
    return (
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <EmptyState
          preset="search"
          action={
            <Button size="sm" variant="secondary" onClick={onClearFilter}>
              Clear Filter
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
      <ProcessList
        items={filtered}
        selectedId={selectedId}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
      />
    </div>
  );
};

export interface MainContentProps {
  activeTab: string;
  selectedProcess: string;
  searchQuery: string;
  isLoading: boolean;
  searchRef?: React.RefObject<HTMLInputElement>;
  onRefresh: () => void;
  onSearchChange: (val: string) => void;
  onSelectProcess: (id: string) => void;
  onOpenStashModal: () => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  selectedProcess,
  searchQuery,
  isLoading,
  searchRef,
  onRefresh,
  onSearchChange,
  onSelectProcess,
  onOpenStashModal,
  onContextMenu,
}) => {
  const filtered = SAMPLE_PROCESSES.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainPanel header={<MainPanelHeader activeTab={activeTab} />}>
      <div className="p-base flex flex-col gap-sm">
        <ActionToolbar
          onOpenStashModal={onOpenStashModal}
          isLoading={isLoading}
          onRefresh={onRefresh}
        />
        <Input
          ref={searchRef}
          leftIcon="search"
          shortcut="Ctrl+F"
          placeholder="Filter windows by name or PID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          clearable
          onClear={() => onSearchChange("")}
        />
        <TaskStatusHeader isLoading={isLoading} />
        <ProcessTableContainer
          isLoading={isLoading}
          filtered={filtered}
          selectedId={selectedProcess}
          onClearFilter={() => onSearchChange("")}
          onSelect={onSelectProcess}
          onContextMenu={onContextMenu}
        />
      </div>
    </MainPanel>
  );
};
