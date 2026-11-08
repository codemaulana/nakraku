import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

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
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 rounded-md bg-accent-emerald text-bg-base font-bold text-lg flex items-center justify-center mb-base shadow-sm">
              N
            </div>

            <h1 className="text-base font-bold tracking-tight mb-2xs">
              Nakraku Stash
            </h1>

            <p className="text-xs text-text-secondary mb-lg">
              Active View: <span className="text-accent-emerald font-mono uppercase">{activeTab}</span>
            </p>

            <div className="border border-border-subtle rounded-sm bg-bg-surface px-base py-sm text-xs text-accent-emerald font-mono">
              Task 2.10: MainPanel Layout Shell Active (Custom Scrollbar Ready)
            </div>
          </div>
        </MainPanel>
      </div>
    </div>
  );
};
