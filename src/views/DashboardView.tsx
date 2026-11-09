import React, { useMemo, useState, useCallback } from "react";
import { MainPanel } from "../components/MainPanel";
import { MemoryMeter } from "../components/MemoryMeter";
import { ProcessCount } from "../components/ProcessCount";
import { StashButton } from "../components/StashButton";
import { LiveWindowList } from "../components/LiveWindowList";
import { ContextMenu, type ContextMenuItem } from "../components/ContextMenu";
import {
  DashboardEmptyState,
  DashboardErrorState,
} from "../components/DashboardStates";
import { SkeletonList } from "../components/SkeletonRow";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { useLiveDashboard, type UseLiveDashboardReturn } from "../hooks/useLiveDashboard";
import { useViewport } from "../context/ViewportContext";
import { useToast } from "../context/ToastContext";
import { minimizeWindow, restoreWindow, stashNow } from "../lib/osApi";
import { TacticalInspectorPanel } from "../components/dashboard/TacticalInspectorPanel";
import type { RawWindow } from "../lib/schemas";

export interface DashboardViewProps {
  searchRef?: React.RefObject<HTMLInputElement>;
  onOpenStashModal?: () => void;
  onContextMenu?: (event: React.MouseEvent, window: RawWindow) => void;
}

const DashboardHeader: React.FC<{ windowCount: number; isLoading: boolean }> = ({
  windowCount,
  isLoading,
}) => (
  <div className="flex items-center justify-between h-row px-base bg-bg-surface/90 border-b border-border-hairline">
    <div className="flex items-center gap-2 font-mono">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-display">
        Dashboard & Live View
      </span>
      <Badge variant="neutral" size="sm">
        {windowCount} Live
      </Badge>
    </div>
    <Badge variant="active" dot pulse size="sm">
      {isLoading ? "SCANNING..." : "OS ENGINE LIVE"}
    </Badge>
  </div>
);

const DashboardControls: React.FC<{
  d: UseLiveDashboardReturn;
  estimatedRam: number;
  uniqueProcesses: number;
}> = ({ d, estimatedRam, uniqueProcesses }) => (
  <div className="flex items-center justify-between gap-xs p-2.5 bg-bg-surface/90 border border-border-hairline rounded-sm tactical-border shadow-xs">
    <div className="flex items-center gap-2">
      <StashButton
        windowCount={d.selectedHwnds.size}
        estimatedRamBytes={estimatedRam}
        loading={d.isStashing}
        onStash={() => d.executeStash()}
      />
      <Button
        variant="secondary"
        icon="restore"
        loading={d.isLoading}
        onClick={() => d.refresh()}
      >
        Scan
      </Button>
    </div>

    <ProcessCount
      windowCount={d.windows.length}
      processCount={uniqueProcesses}
      selectedCount={d.selectedHwnds.size}
    />
  </div>
);

const DashboardContent: React.FC<{
  d: UseLiveDashboardReturn;
  onContextMenu?: (e: React.MouseEvent, win: RawWindow) => void;
}> = ({ d, onContextMenu }) => {
  if (d.isLoading && d.windows.length === 0) {
    return (
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <SkeletonList count={5} />
      </div>
    );
  }
  if (d.windows.length === 0) {
    return <DashboardEmptyState onRefresh={() => d.refresh()} />;
  }
  if (d.filteredWindows.length === 0) {
    return (
      <div className="border border-border-subtle rounded-sm bg-bg-surface overflow-hidden">
        <EmptyState
          preset="search"
          action={
            <Button size="sm" variant="secondary" onClick={() => d.setSearchQuery("")}>
              Clear Filter
            </Button>
          }
        />
      </div>
    );
  }
  return (
    <LiveWindowList
      windows={d.filteredWindows}
      selectedHwnds={d.selectedHwnds}
      onToggleSelect={d.toggleSelect}
      onToggleSelectAll={d.toggleSelectAll}
      sortBy={d.sortBy}
      onSortChange={d.setSortBy}
      onContextMenu={onContextMenu}
    />
  );
};

const DashboardBody: React.FC<{
  d: UseLiveDashboardReturn;
  estimatedRam: number;
  uniqueProcesses: number;
  searchRef?: React.RefObject<HTMLInputElement>;
  onContextMenu?: (e: React.MouseEvent, win: RawWindow) => void;
}> = ({ d, estimatedRam, uniqueProcesses, searchRef, onContextMenu }) => (
  <div className="p-base flex flex-col gap-sm">
    {d.error && <DashboardErrorState error={d.error} onRetry={() => d.refresh()} />}

    {d.memoryStats && (
      <MemoryMeter
        totalBytes={d.memoryStats.total_ram_bytes}
        usedBytes={d.memoryStats.used_ram_bytes}
        availableBytes={d.memoryStats.available_ram_bytes}
        percentage={d.memoryStats.memory_load_percentage}
      />
    )}

    <DashboardControls
      d={d}
      estimatedRam={estimatedRam}
      uniqueProcesses={uniqueProcesses}
    />

    <Input
      ref={searchRef}
      leftIcon="search"
      shortcut="Ctrl+F"
      placeholder="Filter active windows by name, process, or PID..."
      value={d.searchQuery}
      onChange={(e) => d.setSearchQuery(e.target.value)}
      clearable
      onClear={() => d.setSearchQuery("")}
    />

    <DashboardContent d={d} onContextMenu={onContextMenu} />
  </div>
);

const buildWindowMenuItems = (
  win: RawWindow,
  refresh: () => Promise<void>,
  showToast: (msg: string, variant?: "info" | "success" | "warning" | "error") => void
): ContextMenuItem[] => [
  {
    id: "focus",
    label: "Restore & Focus Window",
    icon: "restore",
    onClick: () => {
      void restoreWindow(win.hwnd, win.is_maximized).then(() => refresh()).catch(() => {});
    },
  },
  {
    id: "minimize",
    label: "Minimize Window",
    icon: "window",
    onClick: () => {
      void minimizeWindow(win.hwnd).then(() => refresh()).catch(() => {});
    },
  },
  {
    id: "stash-single",
    label: "Stash Single Window",
    icon: "stash",
    onClick: () => {
      void stashNow("default", `Single: ${win.process_name}`, [win.hwnd])
        .then(() => {
          showToast(`Stashed ${win.process_name}`, "success");
          return refresh();
        })
        .catch(() => {});
    },
  },
  { id: "sep-1", separator: true },
  {
    id: "copy-info",
    label: "Copy HWND & PID",
    icon: "copy",
    onClick: () => {
      void navigator.clipboard?.writeText(`${win.process_name} (PID:${win.process_id} HWND:${win.hwnd})`);
      showToast(`${win.process_name} telemetry copied.`, "info");
    },
  },
];

const useWindowContextMenu = (
  refresh: () => Promise<void>,
  externalHandler?: (event: React.MouseEvent, window: RawWindow) => void
) => {
  const { showToast } = useToast();
  const [ctxTarget, setCtxTarget] = useState<{ x: number; y: number; win: RawWindow } | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent, win: RawWindow) => {
      event.preventDefault();
      externalHandler?.(event, win);
      setCtxTarget({ x: event.clientX, y: event.clientY, win });
    },
    [externalHandler]
  );

  const items = useMemo(
    () => (ctxTarget ? buildWindowMenuItems(ctxTarget.win, refresh, showToast) : []),
    [ctxTarget, refresh, showToast]
  );

  return { ctxTarget, closeCtx: () => setCtxTarget(null), handleContextMenu, items };
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  searchRef,
  onContextMenu,
}) => {
  const d = useLiveDashboard();
  const { mode: viewportMode } = useViewport();
  const ctx = useWindowContextMenu(d.refresh, onContextMenu);

  const estimatedRam = useMemo(
    () => d.windows.filter((w) => d.selectedHwnds.has(w.hwnd)).reduce((acc, w) => acc + w.ram_bytes, 0),
    [d.windows, d.selectedHwnds]
  );

  const uniqueProcesses = useMemo(
    () => new Set(d.windows.map((w) => w.process_name)).size,
    [d.windows]
  );

  return (
    <MainPanel
      header={<DashboardHeader windowCount={d.windows.length} isLoading={d.isLoading} />}
      aside={
        viewportMode === "fullscreen" ? (
          <TacticalInspectorPanel
            windows={d.windows}
            memoryStats={d.memoryStats}
            selectedCount={d.selectedHwnds.size}
            onQuickStashWorkspace={(slot) => {
              void d.executeStashSlot(slot);
            }}
          />
        ) : undefined
      }
    >
      <DashboardBody
        d={d}
        estimatedRam={estimatedRam}
        uniqueProcesses={uniqueProcesses}
        searchRef={searchRef}
        onContextMenu={ctx.handleContextMenu}
      />
      <ContextMenu
        position={ctx.ctxTarget ? { x: ctx.ctxTarget.x, y: ctx.ctxTarget.y } : null}
        items={ctx.items}
        onClose={ctx.closeCtx}
      />
    </MainPanel>
  );
};
