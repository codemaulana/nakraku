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

const ActiveSessionView = React.lazy(() =>
  import("./views/ActiveSessionView").then((m) => ({ default: m.ActiveSessionView }))
);
const SettingsView = React.lazy(() =>
  import("./views/SettingsView").then((m) => ({ default: m.SettingsView }))
);
const AboutView = React.lazy(() =>
  import("./views/AboutView").then((m) => ({ default: m.AboutView }))
);
const Gallery = React.lazy(() =>
  import("./dev/Gallery").then((m) => ({ default: m.Gallery }))
);
import { useAppShortcuts } from "./hooks/useAppShortcuts";
import { useWsBridgeStatus } from "./hooks/useWsBridgeStatus";
import { useAppErrorListener } from "./hooks/useAppErrorListener";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./context/ToastContext";
import { ViewportProvider, useViewport } from "./context/ViewportContext";
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

const ViewLoadingSkeleton: React.FC = () => (
  <div className="p-base flex flex-col gap-2 animate-pulse w-full h-full">
    <div className="h-8 bg-bg-surface border border-border-subtle/40 rounded-sm w-1/3" />
    <div className="h-8 bg-bg-surface border border-border-subtle/30 rounded-sm w-full" />
    <div className="h-8 bg-bg-surface border border-border-subtle/30 rounded-sm w-full" />
  </div>
);

const AppShellOverlays: React.FC<{
  menuItems: ReturnType<typeof createProcessMenuItems>;
  position: { x: number; y: number } | null;
  onCloseMenu: () => void;
  isStashOpen: boolean;
  onCloseStash: () => void;
  isPaletteOpen: boolean;
  onClosePalette: () => void;
  onSelectCommand: (cmd: ShortcutItem) => void;
}> = ({
  menuItems,
  position,
  onCloseMenu,
  isStashOpen,
  onCloseStash,
  isPaletteOpen,
  onClosePalette,
  onSelectCommand,
}) => (
  <>
    <ContextMenu items={menuItems} position={position} onClose={onCloseMenu} />
    <StashModal isOpen={isStashOpen} onClose={onCloseStash} />
    <CommandPalette
      isOpen={isPaletteOpen}
      onClose={onClosePalette}
      onSelectCommand={onSelectCommand}
    />
  </>
);

const createViewState = (
  s: ReturnType<typeof useAppShellState>,
  openContextMenu: (e: React.MouseEvent, item: ProcessItem) => void
): DashboardState => ({
  selectedProcess: s.selectedProcess,
  setSelectedProcess: s.setSelectedProcess,
  searchQuery: s.searchQuery,
  setSearchQuery: s.setSearchQuery,
  isLoading: s.isLoading,
  searchInputRef: s.searchInputRef,
  handleRefresh: s.handleRefresh,
  onOpenStashModal: () => s.setIsStashModalOpen(true),
  onContextMenu: openContextMenu,
});

const AppShellMain: React.FC<{
  currentRoute: AppRoute;
  navigate: (r: AppRoute) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  viewState: DashboardState;
}> = ({ currentRoute, navigate, isSidebarCollapsed, toggleSidebar, viewState }) => (
  <div className="flex flex-1 overflow-hidden">
    <Sidebar
      activeId={currentRoute}
      collapsed={isSidebarCollapsed}
      onToggleCollapse={toggleSidebar}
      onSelect={(id) => navigate(id as AppRoute)}
    />
    <ErrorBoundary>
      <React.Suspense fallback={<ViewLoadingSkeleton />}>
        {renderActiveView(currentRoute, navigate, viewState)}
      </React.Suspense>
    </ErrorBoundary>
  </div>
);

const AppShell: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const s = useAppShellState(navigate);
  const { mode: viewportMode, isSidebarCollapsed, toggleSidebar, setMode } = useViewport();
  const { connected: bridgeConnected, port: bridgePort } = useWsBridgeStatus();
  useAppErrorListener();
  const { position, data, open, close } = useContextMenu<ProcessItem>();
  const menuItems = createProcessMenuItems(data, close);
  const viewState = createViewState(s, open);

  return (
    <div className="flex flex-col h-screen bg-bg-base text-text-primary font-ui overflow-hidden select-none">
      <Titlebar
        badge="v0.1.0"
        viewportMode={viewportMode}
        onViewportModeChange={setMode}
      />
      <AppShellMain
        currentRoute={currentRoute}
        navigate={navigate}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        viewState={viewState}
      />
      <StatusBar
        ramSaved="1.8 GB"
        bridgeConnected={bridgeConnected}
        bridgePort={bridgePort}
        viewportMode={viewportMode}
      />
      <AppShellOverlays
        menuItems={menuItems}
        position={position}
        onCloseMenu={close}
        isStashOpen={s.isStashModalOpen}
        onCloseStash={() => s.setIsStashModalOpen(false)}
        isPaletteOpen={s.isPaletteOpen}
        onClosePalette={() => s.setIsPaletteOpen(false)}
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
      <ViewportProvider>
        <AppShell />
      </ViewportProvider>
    </RouterProvider>
  </ToastProvider>
);
