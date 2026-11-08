import React, { useState } from "react";
import { AppWindow, Terminal, Globe } from "lucide-react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { StatusBar } from "./components/StatusBar";
import { Row } from "./components/Row";

interface ProcessItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  pid: string;
  ram: string;
}

const SAMPLE_PROCESSES: ProcessItem[] = [
  {
    id: "p1",
    title: "Visual Studio Code — nakraku",
    desc: "C:\\Nakraku\\src\\components\\Row.tsx",
    icon: <AppWindow className="w-3.5 h-3.5 text-accent-emerald" />,
    pid: "PID 18420",
    ram: "142.4 MB",
  },
  {
    id: "p2",
    title: "Google Chrome — GitHub PR #42",
    desc: "chrome.exe — 8 tabs active",
    icon: <Globe className="w-3.5 h-3.5 text-status-frozen" />,
    pid: "PID 9424",
    ram: "624.1 MB",
  },
  {
    id: "p3",
    title: "Windows PowerShell — cargo check",
    desc: "powershell.exe — dev profile",
    icon: <Terminal className="w-3.5 h-3.5 text-text-secondary" />,
    pid: "PID 3112",
    ram: "28.5 MB",
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
        icon={item.icon}
        label={item.title}
        description={item.desc}
        selected={selectedId === item.id}
        onClick={() => onSelect(item.id)}
        meta={
          <div className="flex items-center gap-xs">
            <span className="text-text-disabled">{item.pid}</span>
            <span className="text-text-mono">{item.ram}</span>
          </div>
        }
      />
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
              <span className="text-2xs font-mono text-accent-emerald bg-bg-elevated px-1.5 py-0.5 rounded-xs border border-border-subtle">
                READY
              </span>
            </div>
          }
        >
          <div className="p-base flex flex-col gap-sm">
            <div className="text-2xs font-mono text-text-secondary uppercase tracking-wider">
              Task 2.12: Live Windows (32px Base Row Component)
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
