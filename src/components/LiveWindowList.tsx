import React, { useMemo } from "react";
import { useVirtualList } from "../hooks/useVirtualList";
import { Row } from "./Row";
import { Badge } from "./Badge";
import { AppIcon } from "./AppIcon";
import { formatBytes } from "./MemoryMeter";
import type { RawWindow } from "../lib/schemas";

export type WindowSortOption = "memory" | "title" | "process" | "zorder";

const titleCollator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

export interface LiveWindowListProps {
  windows: RawWindow[];
  selectedHwnds: Set<string>;
  onToggleSelect: (hwnd: string) => void;
  onToggleSelectAll: () => void;
  sortBy: WindowSortOption;
  onSortChange: (sort: WindowSortOption) => void;
  onContextMenu?: (event: React.MouseEvent, window: RawWindow) => void;
}

export const sortWindows = (
  windows: RawWindow[],
  sortBy: WindowSortOption
): RawWindow[] => {
  return [...windows].sort((a, b) => {
    switch (sortBy) {
      case "memory":
        return b.ram_bytes - a.ram_bytes;
      case "title":
        return titleCollator.compare(a.title, b.title);
      case "process":
        return titleCollator.compare(a.process_name, b.process_name);
      case "zorder":
      default:
        return a.z_order - b.z_order;
    }
  });
};

const WindowListHeader: React.FC<{
  allSelected: boolean;
  someSelected: boolean;
  totalCount: number;
  selectedCount: number;
  sortBy: WindowSortOption;
  onToggleSelectAll: () => void;
  onSortChange: (s: WindowSortOption) => void;
}> = ({
  allSelected,
  someSelected,
  totalCount,
  selectedCount,
  sortBy,
  onToggleSelectAll,
  onSortChange,
}) => (
  <div className="flex items-center justify-between px-base py-1.5 bg-bg-surface/90 border-b border-border-hairline text-3xs font-mono uppercase text-text-secondary select-none">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={allSelected}
        ref={(el) => {
          if (el) el.indeterminate = someSelected && !allSelected;
        }}
        onChange={onToggleSelectAll}
        className="w-3.5 h-3.5 rounded-2xs bg-bg-base border-border-hairline accent-emerald-400 cursor-pointer"
        aria-label="Select all windows"
      />
      <span className="font-bold tracking-wider text-text-primary">
        {selectedCount}/{totalCount} SELECTED
      </span>
    </div>

    <div className="flex items-center gap-1.5">
      <span className="text-text-disabled uppercase">Sort:</span>
      {(["memory", "title", "process", "zorder"] as WindowSortOption[]).map(
        (opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSortChange(opt)}
            className={`px-2 py-0.5 rounded-xs transition-colors ${
              sortBy === opt
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                : "text-text-disabled hover:text-text-secondary border border-transparent"
            }`}
          >
            {opt}
          </button>
        )
      )}
    </div>
  </div>
);

const WindowRowControls: React.FC<{
  win: RawWindow;
  isChecked: boolean;
  onToggle: () => void;
}> = ({ win, isChecked, onToggle }) => (
  <div className="flex items-center gap-2.5 shrink-0">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onToggle}
      onClick={(e) => e.stopPropagation()}
      className="w-3.5 h-3.5 rounded-2xs bg-bg-surface border-border-hairline accent-emerald-400 cursor-pointer"
      aria-label={`Select window ${win.title}`}
    />
    <AppIcon
      iconBase64={win.icon_base64}
      processName={win.process_name}
      title={win.title}
      size="sm"
    />
  </div>
);

const WindowRowMeta: React.FC<{ win: RawWindow }> = ({ win }) => (
  <div className="flex items-center gap-2 font-mono">
    {win.is_elevated && (
      <Badge variant="warning" size="sm">
        ADMIN
      </Badge>
    )}
    {win.is_minimized && (
      <Badge variant="neutral" size="sm">
        MIN
      </Badge>
    )}
    <span className="text-2xs font-mono px-1.5 py-0.5 rounded-xs bg-bg-surface border border-border-hairline text-emerald-400 font-semibold tabular-nums">
      {formatBytes(win.ram_bytes)}
    </span>
  </div>
);

const LiveWindowRow = React.memo<{
  win: RawWindow;
  isChecked: boolean;
  onToggle: (hwnd: string) => void;
  onContextMenu?: (e: React.MouseEvent, win: RawWindow) => void;
}>(({ win, isChecked, onToggle, onContextMenu }) => (
  <Row
    key={win.hwnd}
    size="md"
    selected={isChecked}
    highlightOnHover
    onClick={() => onToggle(win.hwnd)}
    onContextMenu={(e) => onContextMenu?.(e, win)}
    icon={
      <WindowRowControls
        win={win}
        isChecked={isChecked}
        onToggle={() => onToggle(win.hwnd)}
      />
    }
    label={
      <span className="truncate text-text-primary font-medium tracking-tight">
        {win.title}
      </span>
    }
    description={
      <span className="font-mono text-3xs text-text-disabled flex items-center gap-1.5">
        <span className="text-text-secondary">{win.process_name}</span>
        <span>•</span>
        <span>PID:{win.process_id}</span>
      </span>
    }
    meta={<WindowRowMeta win={win} />}
  />
));
LiveWindowRow.displayName = "LiveWindowRow";

const VirtualWindowListContent: React.FC<{
  windows: RawWindow[];
  selectedHwnds: Set<string>;
  onToggleSelect: (hwnd: string) => void;
  onContextMenu?: (event: React.MouseEvent, window: RawWindow) => void;
}> = ({ windows, selectedHwnds, onToggleSelect, onContextMenu }) => {
  const { totalHeight, items, onScroll } = useVirtualList({
    count: windows.length,
    itemHeight: 36,
    viewportHeight: 360,
  });

  return (
    <div
      onScroll={onScroll}
      className="max-h-[360px] overflow-y-auto custom-scrollbar relative"
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        {items.map((item) => {
          const win = windows[item.index];
          if (!win) return null;
          return (
            <div
              key={win.hwnd}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "36px",
                transform: `translateY(${item.start}px)`,
              }}
            >
              <LiveWindowRow
                win={win}
                isChecked={selectedHwnds.has(win.hwnd)}
                onToggle={onToggleSelect}
                onContextMenu={onContextMenu}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StandardWindowListContent: React.FC<{
  windows: RawWindow[];
  selectedHwnds: Set<string>;
  onToggleSelect: (hwnd: string) => void;
  onContextMenu?: (event: React.MouseEvent, window: RawWindow) => void;
}> = ({ windows, selectedHwnds, onToggleSelect, onContextMenu }) => (
  <div className="flex flex-col divide-y divide-border-subtle/50 max-h-[360px] overflow-y-auto custom-scrollbar">
    {windows.map((win) => (
      <LiveWindowRow
        key={win.hwnd}
        win={win}
        isChecked={selectedHwnds.has(win.hwnd)}
        onToggle={onToggleSelect}
        onContextMenu={onContextMenu}
      />
    ))}
  </div>
);

export const LiveWindowList: React.FC<LiveWindowListProps> = ({
  windows,
  selectedHwnds,
  onToggleSelect,
  onToggleSelectAll,
  sortBy,
  onSortChange,
  onContextMenu,
}) => {
  const sorted = useMemo(() => sortWindows(windows, sortBy), [windows, sortBy]);
  const allSelected = windows.length > 0 && selectedHwnds.size === windows.length;
  const someSelected = selectedHwnds.size > 0 && !allSelected;

  return (
    <div
      className="flex flex-col border border-border-subtle rounded-sm bg-bg-surface overflow-hidden"
      role="table"
      aria-label="Active desktop windows"
    >
      <WindowListHeader
        allSelected={allSelected}
        someSelected={someSelected}
        totalCount={windows.length}
        selectedCount={selectedHwnds.size}
        sortBy={sortBy}
        onToggleSelectAll={onToggleSelectAll}
        onSortChange={onSortChange}
      />

      {windows.length > 30 ? (
        <VirtualWindowListContent
          windows={sorted}
          selectedHwnds={selectedHwnds}
          onToggleSelect={onToggleSelect}
          onContextMenu={onContextMenu}
        />
      ) : (
        <StandardWindowListContent
          windows={sorted}
          selectedHwnds={selectedHwnds}
          onToggleSelect={onToggleSelect}
          onContextMenu={onContextMenu}
        />
      )}
    </div>
  );
};
