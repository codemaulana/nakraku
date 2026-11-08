import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { StatusBar } from "./components/StatusBar";
import { Row } from "./components/Row";
import { Badge } from "./components/Badge";
import { Icon } from "./components/Icon";
import { Tooltip } from "./components/Tooltip";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { Kbd } from "./components/Kbd";
import { Spinner } from "./components/Spinner";
import { SkeletonList } from "./components/SkeletonRow";
import { EmptyState } from "./components/EmptyState";
import { ContextMenu, useContextMenu } from "./components/ContextMenu";
import { StashModal } from "./components/StashModal";
import {
  SAMPLE_PROCESSES,
  createProcessMenuItems,
  type ProcessItem,
} from "./data/sampleProcesses";

interface ProcessListProps {
  items: ProcessItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

const ProcessList: React.FC<ProcessListProps> = ({
  items,
  selectedId,
  onSelect,
  onContextMenu,
}) => (
  <div className="flex flex-col w-full divide-y divide-border-subtle/50">
    {items.map((item) => (
      <Row
        key={item.id}
        icon={<Icon name={item.iconName} size="sm" className={item.iconColor} />}
        label={item.title}
        description={item.desc}
        selected={selectedId === item.id}
        onClick={() => onSelect(item.id)}
        onContextMenu={(e) => onContextMenu(e, item)}
        actions={
          <Tooltip content={`Pin ${item.title}`} shortcut="Alt+P" position="left">
            <Button
              variant="ghost"
              iconOnly
              size="sm"
              icon="pin"
              aria-label={`Pin ${item.title}`}
            />
          </Tooltip>
        }
        meta={
          <div className="flex items-center gap-xs">
            <Badge variant={item.status} size="sm" dot={item.status !== "neutral"}>
              {item.statusText}
            </Badge>
            <span className="text-text-disabled">{item.pid}</span>
            <span className="text-text-mono">{item.ram}</span>
          </div>
        }
      />
    ))}
  </div>
);

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

interface MainContentProps {
  activeTab: string;
  selectedProcess: string;
  searchQuery: string;
  isLoading: boolean;
  onRefresh: () => void;
  onSearchChange: (val: string) => void;
  onSelectProcess: (id: string) => void;
  onOpenStashModal: () => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

const TaskStatusHeader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
    <div className="flex items-center gap-1.5">
      <span>Task 2.22: EmptyState Component</span>
      {isLoading && <Spinner size="xs" variant="accent" />}
    </div>
    <div className="flex items-center gap-1.5">
      <span className="text-text-disabled">Keys:</span>
      <Kbd shortcut="Ctrl+B" size="xs" variant="elevated" />
      <Kbd shortcut="Ctrl+K" size="xs" variant="default" splitKeys />
    </div>
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

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  selectedProcess,
  searchQuery,
  isLoading,
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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStashModalOpen, setIsStashModalOpen] = useState<boolean>(false);
  const { position, data, open, close } = useContextMenu<ProcessItem>();

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  const menuItems = createProcessMenuItems(data, close);

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar badge="v0.1.0" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={activeTab} onSelect={setActiveTab} />
        <MainContent
          activeTab={activeTab}
          selectedProcess={selectedProcess}
          searchQuery={searchQuery}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onSearchChange={setSearchQuery}
          onSelectProcess={setSelectedProcess}
          onOpenStashModal={() => setIsStashModalOpen(true)}
          onContextMenu={open}
        />
      </div>
      <StatusBar ramSaved="1.8 GB" />
      <ContextMenu items={menuItems} position={position} onClose={close} />
      <StashModal
        isOpen={isStashModalOpen}
        onClose={() => setIsStashModalOpen(false)}
      />
    </div>
  );
};
