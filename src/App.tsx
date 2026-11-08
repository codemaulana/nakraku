import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { StatusBar } from "./components/StatusBar";
import { Row } from "./components/Row";
import { Badge, type BadgeVariant } from "./components/Badge";
import { Icon, type IconName } from "./components/Icon";
import { Tooltip } from "./components/Tooltip";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import {
  ContextMenu,
  useContextMenu,
  type ContextMenuItem,
} from "./components/ContextMenu";
import { StashModal } from "./components/StashModal";

interface ProcessItem {
  id: string;
  title: string;
  desc: string;
  iconName: IconName;
  iconColor: string;
  pid: string;
  ram: string;
  status: BadgeVariant;
  statusText: string;
}

const SAMPLE_PROCESSES: ProcessItem[] = [
  {
    id: "p1",
    title: "Visual Studio Code — nakraku",
    desc: "C:\\Nakraku\\src\\components\\Row.tsx",
    iconName: "window",
    iconColor: "text-accent-emerald",
    pid: "PID 18420",
    ram: "142.4 MB",
    status: "active",
    statusText: "RUNNING",
  },
  {
    id: "p2",
    title: "Google Chrome — GitHub PR #42",
    desc: "chrome.exe — 8 tabs active",
    iconName: "globe",
    iconColor: "text-status-frozen",
    pid: "PID 9424",
    ram: "624.1 MB",
    status: "frozen",
    statusText: "FROZEN",
  },
  {
    id: "p3",
    title: "Windows PowerShell — cargo check",
    desc: "powershell.exe — dev profile",
    iconName: "terminal",
    iconColor: "text-text-secondary",
    pid: "PID 3112",
    ram: "28.5 MB",
    status: "neutral",
    statusText: "IDLE",
  },
];

const createWorkspaceSubMenu = (onClose: () => void): ContextMenuItem[] => [
  { id: "ws-dev", label: "Dev Core (Active)", onClick: onClose },
  { id: "ws-ai", label: "Research & AI", onClick: onClose },
  { id: "ws-personal", label: "Personal", onClick: onClose },
];

const createProcessMenuItems = (
  item: ProcessItem | null,
  onClose: () => void
): ContextMenuItem[] => [
  { id: "focus", label: "Focus Window", icon: "window", shortcut: "Enter", onClick: onClose },
  { id: "pin", label: "Pin to Workspace", icon: "pin", shortcut: "Alt+P", onClick: onClose },
  { id: "move-sub", label: "Move to Workspace", icon: "workspaces", subMenu: createWorkspaceSubMenu(onClose) },
  { id: "sep-1", separator: true },
  { id: "stash", label: "Stash Window", icon: "stash", shortcut: "Ctrl+S", onClick: onClose },
  { id: "copy", label: "Copy Process Info", icon: "copy", shortcut: "Ctrl+C", onClick: onClose },
  { id: "sep-2", separator: true },
  { id: "kill", label: `End Task (${item?.pid ?? "PID"})`, icon: "trash", danger: true, shortcut: "Del", onClick: onClose },
];

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
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({ onOpenStashModal }) => (
  <div className="flex items-center gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm">
    <span className="text-2xs font-mono text-text-disabled uppercase mr-2xs">
      Buttons:
    </span>
    <Tooltip content="Stash All Windows" shortcut="Ctrl+S" position="bottom">
      <Button variant="primary" icon="stash" onClick={onOpenStashModal}>
        Stash Now
      </Button>
    </Tooltip>

    <Tooltip content="Restore Previous Session" shortcut="Ctrl+R" position="bottom">
      <Button variant="secondary" icon="restore">
        Restore
      </Button>
    </Tooltip>

    <Tooltip content="Emergency purge" position="bottom">
      <Button variant="danger" icon="trash">
        Purge
      </Button>
    </Tooltip>

    <Button variant="ghost">
      Ghost
    </Button>
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
  onSearchChange: (val: string) => void;
  onSelectProcess: (id: string) => void;
  onOpenStashModal: () => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  activeTab,
  selectedProcess,
  searchQuery,
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
        <ActionToolbar onOpenStashModal={onOpenStashModal} />
        <Input
          leftIcon="search"
          shortcut="Ctrl+F"
          placeholder="Filter windows by name or PID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          clearable
          onClear={() => onSearchChange("")}
        />
        <div className="text-2xs font-mono text-text-secondary uppercase tracking-wider">
          Task 2.19: Input (32px Density, Monospace Text, Label Above)
        </div>
        <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
          <ProcessList
            items={filtered}
            selectedId={selectedProcess}
            onSelect={onSelectProcess}
            onContextMenu={onContextMenu}
          />
        </div>
      </div>
    </MainPanel>
  );
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isStashModalOpen, setIsStashModalOpen] = useState<boolean>(false);
  const { position, data, open, close } = useContextMenu<ProcessItem>();

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
