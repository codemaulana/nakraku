import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { StatusBar } from "./components/StatusBar";
import { Row } from "./components/Row";
import { Badge, type BadgeVariant } from "./components/Badge";
import { Icon, type IconName } from "./components/Icon";

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

const ProcessList: React.FC<{ selectedId: string; onSelect: (id: string) => void }> = ({
  selectedId,
  onSelect,
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

const SHOWCASE_ICONS: IconName[] = [
  "stash",
  "restore",
  "search",
  "filter",
  "pin",
  "trash",
  "lock",
  "wifi",
  "cpu",
  "memory",
  "sparkles",
];

const IconShowcase: React.FC = () => (
  <div className="flex items-center gap-xs p-xs bg-bg-surface border border-border-subtle rounded-sm">
    <span className="text-2xs font-mono text-text-disabled uppercase mr-2xs">
      Icon System (14px/1.5px):
    </span>
    {SHOWCASE_ICONS.map((name) => (
      <div
        key={name}
        title={name}
        className="w-5 h-5 flex items-center justify-center rounded-xs bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <Icon name={name} size={14} />
      </div>
    ))}
  </div>
);

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");

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
              <Badge variant="active" dot pulse size="sm">
                SYSTEM OK
              </Badge>
            </div>
          }
        >
          <div className="p-base flex flex-col gap-sm">
            <IconShowcase />
            <div className="text-2xs font-mono text-text-secondary uppercase tracking-wider">
              Task 2.14: Unified Thin-Line Icon System
            </div>
            <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
              <ProcessList
                selectedId={selectedProcess}
                onSelect={setSelectedProcess}
              />
            </div>
          </div>
        </MainPanel>
      </div>
      <StatusBar ramSaved="1.8 GB" />
    </div>
  );
};
