import React, { useCallback, useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { RouterProvider, useRouter } from "./router/Router";
import { Titlebar } from "./components/Titlebar";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { StashModal } from "./components/StashModal";
import { CommandPalette } from "./components/CommandPalette";
import { DashboardView } from "./views/DashboardView";
import { WorkspacesView } from "./views/WorkspacesView";

const ActiveSessionView = React.lazy(() =>
  import("./views/ActiveSessionView").then((m) => ({ default: m.ActiveSessionView }))
);
const SpatialMinimapView = React.lazy(() =>
  import("./views/SpatialMinimapView").then((m) => ({ default: m.SpatialMinimapView }))
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
import { ToastProvider, useToast } from "./context/ToastContext";
import { ViewportProvider, useViewport } from "./context/ViewportContext";
import { restoreWorkspace } from "./lib/osApi";
import type { ShortcutItem } from "./lib/shortcuts";
import type { AppRoute } from "./lib/routes";

interface DashboardState {
  searchInputRef: React.RefObject<HTMLInputElement>;
  onOpenStashModal: () => void;
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
    case "minimap":
      return <SpatialMinimapView />;
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

interface CommandHandlers {
  navigate: (r: AppRoute) => void;
  openStash: () => void;
  focusSearch: () => void;
  restoreLast: () => void;
  toggleSidebar: () => void;
  openPalette: () => void;
}

const handleCommand = (cmd: ShortcutItem, h: CommandHandlers) => {
  if (cmd.route) {
    h.navigate(cmd.route);
  } else if (cmd.actionId === "stash-all" || cmd.actionId === "global-stash") {
    h.openStash();
  } else if (cmd.actionId === "restore-last") {
    h.restoreLast();
  } else if (cmd.actionId === "toggle-sidebar") {
    h.toggleSidebar();
  } else if (cmd.actionId === "open-palette") {
    h.openPalette();
  } else if (cmd.actionId === "focus-search") {
    h.navigate("dashboard");
    setTimeout(h.focusSearch, 50);
  }
};

const useTauriGlobalListeners = (onOpenStash: () => void, onRestoreLast: () => void) => {
  useEffect(() => {
    if (!isTauri()) return;
    let unsub1: (() => void) | undefined;
    let unsub2: (() => void) | undefined;
    let unsub3: (() => void) | undefined;

    listen("global:new-stash", onOpenStash).then((u) => { unsub1 = u; }).catch(() => {});
    listen("tray:stash-now", onOpenStash).then((u) => { unsub2 = u; }).catch(() => {});
    listen("global:restore-last", onRestoreLast).then((u) => { unsub3 = u; }).catch(() => {});

    return () => {
      unsub1?.();
      unsub2?.();
      unsub3?.();
    };
  }, [onOpenStash, onRestoreLast]);
};

const useAppShellState = (navigate: (r: AppRoute) => void) => {
  const { showToast } = useToast();
  const [isStashModalOpen, setIsStashModalOpen] = useState<boolean>(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  const restoreLast = useCallback(() => {
    if (!isTauri()) return;
    restoreWorkspace("default")
      .then((res) => showToast(`Restored ${res.restored_count} windows from last session.`, "success"))
      .catch((err) => showToast(err instanceof Error ? err.message : String(err), "error"));
  }, [showToast]);

  const openStashModal = useCallback(() => setIsStashModalOpen(true), []);

  useAppShortcuts({
    onOpenStash: openStashModal,
    onFocusSearch: () => {
      navigate("dashboard");
      setTimeout(focusSearch, 50);
    },
    onOpenPalette: () => setIsPaletteOpen(true),
    onSelectRoute: (r) => navigate(r),
    onRestoreLast: restoreLast,
  });

  useTauriGlobalListeners(openStashModal, restoreLast);

  return {
    isStashModalOpen,
    setIsStashModalOpen,
    isPaletteOpen,
    setIsPaletteOpen,
    searchInputRef,
    focusSearch,
    restoreLast,
  };
};

const ViewLoadingSkeleton: React.FC = () => (
  <div className="p-base flex flex-col gap-2 animate-pulse w-full h-full">
    <div className="h-8 bg-bg-surface border border-border-subtle/40 rounded-sm w-1/3" />
    <div className="h-8 bg-bg-surface border border-border-subtle/30 rounded-sm w-full" />
    <div className="h-8 bg-bg-surface border border-border-subtle/30 rounded-sm w-full" />
  </div>
);

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

  const viewState: DashboardState = {
    searchInputRef: s.searchInputRef,
    onOpenStashModal: () => s.setIsStashModalOpen(true),
  };

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
        bridgeConnected={bridgeConnected}
        bridgePort={bridgePort}
        viewportMode={viewportMode}
      />
      <StashModal isOpen={s.isStashModalOpen} onClose={() => s.setIsStashModalOpen(false)} />
      <CommandPalette
        isOpen={s.isPaletteOpen}
        onClose={() => s.setIsPaletteOpen(false)}
        onSelectCommand={(cmd) =>
          handleCommand(cmd, {
            navigate,
            openStash: () => s.setIsStashModalOpen(true),
            focusSearch: s.focusSearch,
            restoreLast: s.restoreLast,
            toggleSidebar,
            openPalette: () => s.setIsPaletteOpen(true),
          })
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
