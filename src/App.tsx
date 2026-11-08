import React, { useRef, useState } from "react";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { ContextMenu, useContextMenu } from "./components/ContextMenu";
import { StashModal } from "./components/StashModal";
import { Gallery } from "./dev/Gallery";
import { MainContent } from "./components/MainContent";
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import {
  createProcessMenuItems,
  type ProcessItem,
} from "./data/sampleProcesses";

const useAppState = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStashModalOpen, setIsStashModalOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  useAppShortcuts({
    onOpenStash: () => setIsStashModalOpen(true),
    onFocusSearch: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    onSelectTab: setActiveTab,
  });

  return {
    activeTab,
    setActiveTab,
    selectedProcess,
    setSelectedProcess,
    searchQuery,
    setSearchQuery,
    isLoading,
    isStashModalOpen,
    setIsStashModalOpen,
    searchInputRef,
    handleRefresh,
  };
};

export const App: React.FC = () => {
  const s = useAppState();
  const { position, data, open, close } = useContextMenu<ProcessItem>();
  const menuItems = createProcessMenuItems(data, close);

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar badge="v0.1.0" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={s.activeTab} onSelect={s.setActiveTab} />
        {s.activeTab === "gallery" ? (
          <Gallery onClose={() => s.setActiveTab("dashboard")} />
        ) : (
          <MainContent
            activeTab={s.activeTab}
            selectedProcess={s.selectedProcess}
            searchQuery={s.searchQuery}
            isLoading={s.isLoading}
            searchRef={s.searchInputRef}
            onRefresh={s.handleRefresh}
            onSearchChange={s.setSearchQuery}
            onSelectProcess={s.setSelectedProcess}
            onOpenStashModal={() => s.setIsStashModalOpen(true)}
            onContextMenu={open}
          />
        )}
      </div>
      <StatusBar ramSaved="1.8 GB" />
      <ContextMenu items={menuItems} position={position} onClose={close} />
      <StashModal
        isOpen={s.isStashModalOpen}
        onClose={() => s.setIsStashModalOpen(false)}
      />
    </div>
  );
};
