import React, { useRef, useState } from "react";
import { RouterProvider, useRouter } from "./router/Router";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { ContextMenu, useContextMenu } from "./components/ContextMenu";
import { StashModal } from "./components/StashModal";
import { CommandPalette } from "./components/CommandPalette";
import { DashboardView } from "./views/DashboardView";
import { WorkspacesView } from "./views/WorkspacesView";
import { ActiveSessionView } from "./views/ActiveSessionView";
import { SettingsView } from "./views/SettingsView";
import { AboutView } from "./views/AboutView";
import { Gallery } from "./dev/Gallery";
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { useWsBridgeStatus } from "./hooks/useWsBridgeStatus";
import { useAppErrorListener } from "./hooks/useAppErrorListener";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import {
  createProcessMenuItems,
  type ProcessItem,
} from "./data/sampleProcesses";
import type { ShortcutItem } from "./lib/shortcuts";
import type { AppRoute } from "./lib/routes";

interface DashboardState {
  selectedProcess: string;
  setSelectedProcess: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleRefresh: () => void;
  onOpenStashModal: () => void;
  onContextMenu: (e: React.MouseEvent, item: ProcessItem) => void;
}

const renderActiveView = (
  route: AppRoute,
  navigate: (r: AppRoute) => void,
  state: DashboardState
) => {
  switch (route) {
    case "workspaces":
      return <WorkspacesView />;
    case "active-session":
      return <ActiveSessionView />;
    case "settings":
      return <SettingsView />;
    case "about":
      return <AboutView />;
    case "gallery":
      return <Gallery onClose={() => navigate("dashboard")} />;
    case "dashboard":
    default:
      return (
        <DashboardView
          searchRef={state.searchInputRef}
          onOpenStashModal={state.onOpenStashModal}
        />
      );
  }
};

const handleCommand = (
  cmd: ShortcutItem,
  navigate: (r: AppRoute) => void,
  openStash: () => void,
  focusSearch: () => void
) => {
  if (cmd.route) {
    navigate(cmd.route);
  } else if (cmd.actionId === "stash-all" || cmd.actionId === "global-stash") {
    openStash();
  } else if (cmd.actionId === "focus-search") {
    navigate("dashboard");
    setTimeout(focusSearch, 50);
  }
};

const useAppShellState = (navigate: (r: AppRoute) => void) => {
  const [isStashModalOpen, setIsStashModalOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [selectedProcess, setSelectedProcess] = useState<string>("p1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  };

  useAppShortcuts({
    onOpenStash: () => setIsStashModalOpen(true),
    onFocusSearch: () => {
      navigate("dashboard");
      setTimeout(focusSearch, 50);
    },
    onOpenPalette: () => setIsPaletteOpen(true),
    onSelectRoute: (r) => navigate(r),
  });

  return {
    isStashModalOpen,
    setIsStashModalOpen,
    isPaletteOpen,
    setIsPaletteOpen,
    selectedProcess,
    setSelectedProcess,
    searchQuery,
    setSearchQuery,
    isLoading,
    searchInputRef,
    handleRefresh,
    focusSearch,
  };
};

const AppShell: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const s = useAppShellState(navigate);
  const { connected: bridgeConnected, port: bridgePort } = useWsBridgeStatus();
  useAppErrorListener();
  const { position, data, open, close } = useContextMenu<ProcessItem>();
  const menuItems = createProcessMenuItems(data, close);

  const viewState: DashboardState = {
    selectedProcess: s.selectedProcess,
    setSelectedProcess: s.setSelectedProcess,
    searchQuery: s.searchQuery,
    setSearchQuery: s.setSearchQuery,
    isLoading: s.isLoading,
    searchInputRef: s.searchInputRef,
    handleRefresh: s.handleRefresh,
    onOpenStashModal: () => s.setIsStashModalOpen(true),
    onContextMenu: open,
  };

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar badge="v0.1.0" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={currentRoute} onSelect={(id) => navigate(id as AppRoute)} />
        <ErrorBoundary>
          {renderActiveView(currentRoute, navigate, viewState)}
        </ErrorBoundary>
      </div>
      <StatusBar
        ramSaved="1.8 GB"
        bridgeConnected={bridgeConnected}
        bridgePort={bridgePort}
      />
      <ContextMenu items={menuItems} position={position} onClose={close} />
      <StashModal
        isOpen={s.isStashModalOpen}
        onClose={() => s.setIsStashModalOpen(false)}
      />
      <CommandPalette
        isOpen={s.isPaletteOpen}
        onClose={() => s.setIsPaletteOpen(false)}
        onSelectCommand={(cmd) =>
          handleCommand(cmd, navigate, () => s.setIsStashModalOpen(true), s.focusSearch)
        }
      />
    </div>
  );
};

export const App: React.FC = () => (
  <ToastProvider>
    <RouterProvider>
      <AppShell />
    </RouterProvider>
  </ToastProvider>
);
