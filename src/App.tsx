import React, { useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar badge="v0.1.0" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={activeTab} onSelect={setActiveTab} />

        <main className="flex-1 flex flex-col items-center justify-center p-lg">
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
            Task 2.9: 200px Sidebar Layout Shell Active (Ctrl+B to Toggle)
          </div>
        </main>
      </div>
    </div>
  );
};
