import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { StatusBar } from "./components/StatusBar";
import { Row } from "./components/Row";
import { Badge, type BadgeVariant } from "./components/Badge";
import { Icon, type IconName } from "./components/Icon";
import { Tooltip } from "./components/Tooltip";
import {
  ContextMenu,
  useContextMenu,
  type ContextMenuItem,
} from "./components/ContextMenu";

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
  selectedId: string;
  onSelect: (id: string) => void;
  onContextMenu: (event: React.MouseEvent, item: ProcessItem) => void;
}

const ProcessList: React.FC<ProcessListProps> = ({
  selectedId,
  onSelect,
  onContextMenu,
}) => (
  <div className="flex flex-col w-full divide-y divide-border-subtle/50">
    {SAMPLE_PROCESSES.map((item) => (
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
            <button
              type="button"
              className="p-1 rounded-xs hover:bg-bg-hover text-text-disabled hover:text-text-primary transition-colors"
            >
              <Icon name="pin" size={12} />
            </button>
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

const ActionToolbar: React.FC = () => (
  <div className="flex items-center gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm">
    <span className="text-2xs font-mono text-text-disabled uppercase mr-2xs">
      Actions:
    </span>
    <Tooltip content="Stash All Windows" shortcut="Ctrl+S" position="bottom">
      <button
        type="button"
        className="flex items-center gap-1.5 px-2 py-1 rounded-xs bg-accent-emerald text-bg-base font-medium text-xs hover:bg-accent-emerald-hover transition-colors"
      >
        <Icon name="stash" size={13} strokeWidth={2} />
        <span>Stash Now</span>
      </button>
    </Tooltip>

    <Tooltip content="Restore Previous Session" shortcut="Ctrl+R" position="bottom">
      <button
        type="button"
        className="flex items-center gap-1.5 px-2 py-1 rounded-xs bg-bg-elevated text-text-primary border border-border-subtle hover:bg-bg-hover transition-colors text-xs"
      >
        <Icon name="restore" size={13} />
        <span>Restore</span>
      </button>
    </Tooltip>

    <Tooltip content="Filter Active Windows" shortcut="Ctrl+F" position="bottom">
      <button
        type="button"
        className="p-1.5 rounded-xs bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-subtle hover:bg-bg-hover transition-colors"
      >
        <Icon name="filter" size={13} />
      </button>
    </Tooltip>
  </div>
);

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");
  const { position, data, open, close } = useContextMenu<ProcessItem>();

  const menuItems = createProcessMenuItems(data, close);

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar badge="v0.1.0" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={activeTab} onSelect={setActiveTab} />
        <MainPanel
          header={
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
          }
        >
          <div className="p-base flex flex-col gap-sm">
            <ActionToolbar />
            <div className="text-2xs font-mono text-text-secondary uppercase tracking-wider">
              Task 2.16: Right-Click ContextMenu (Keyboard Nav & Sub-menus)
            </div>
            <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
              <ProcessList
                selectedId={selectedProcess}
                onSelect={setSelectedProcess}
                onContextMenu={open}
              />
            </div>
          </div>
        </MainPanel>
      </div>
      <StatusBar ramSaved="1.8 GB" />
      <ContextMenu items={menuItems} position={position} onClose={close} />
    </div>
  );
};
