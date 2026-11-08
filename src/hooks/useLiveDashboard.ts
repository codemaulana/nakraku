import { useState, useEffect, useCallback, useMemo } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getLiveWindows, getMemoryStats, stashNow } from "../lib/api";
import type { RawWindow, MemoryStats, StashResult } from "../lib/schemas";
import type { WindowSortOption } from "../components/LiveWindowList";

export interface UseLiveDashboardReturn {
  windows: RawWindow[];
  filteredWindows: RawWindow[];
  memoryStats: MemoryStats | null;
  isLoading: boolean;
  isStashing: boolean;
  error: string | null;
  searchQuery: string;
  selectedHwnds: Set<string>;
  sortBy: WindowSortOption;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: WindowSortOption) => void;
  toggleSelect: (hwnd: string) => void;
  toggleSelectAll: () => void;
  refresh: () => Promise<void>;
  executeStash: (workspaceId?: string, sessionName?: string) => Promise<StashResult | null>;
  clearError: () => void;
}

const useDashboardData = () => {
  const [windows, setWindows] = useState<RawWindow[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [live, mem] = await Promise.all([
        getLiveWindows(),
        getMemoryStats().catch(() => null),
      ]);
      setWindows(live);
      if (mem) setMemoryStats(mem);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { windows, memoryStats, isLoading, error, setError, refresh };
};

const useDashboardSelection = (windows: RawWindow[]) => {
  const [selectedHwnds, setSelectedHwnds] = useState<Set<string>>(new Set());

  const activeHwnds = useMemo(() => {
    if (selectedHwnds.size === 0) {
      return new Set(windows.map((w) => w.hwnd));
    }
    const valid = new Set(windows.map((w) => w.hwnd));
    return new Set([...selectedHwnds].filter((h) => valid.has(h)));
  }, [windows, selectedHwnds]);

  const toggleSelect = useCallback((hwnd: string) => {
    setSelectedHwnds((prev) => {
      const next = new Set(prev.size === 0 ? windows.map((w) => w.hwnd) : prev);
      if (next.has(hwnd)) next.delete(hwnd);
      else next.add(hwnd);
      return next;
    });
  }, [windows]);

  const toggleSelectAll = useCallback(() => {
    setSelectedHwnds((prev) =>
      prev.size === windows.length ? new Set(["none"]) : new Set(windows.map((w) => w.hwnd))
    );
  }, [windows]);

  return { selectedHwnds: activeHwnds, toggleSelect, toggleSelectAll };
};

const useDashboardStash = (refresh: () => Promise<void>, setError: (e: string | null) => void) => {
  const [isStashing, setIsStashing] = useState(false);

  const executeStash = useCallback(
    async (workspaceId = "default", sessionName?: string) => {
      try {
        setIsStashing(true);
        const name = sessionName ?? `Stash ${new Date().toLocaleTimeString()}`;
        const result = await stashNow(workspaceId, name);
        await refresh();
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return null;
      } finally {
        setIsStashing(false);
      }
    },
    [refresh, setError]
  );

  return { isStashing, executeStash };
};

const setupEventSubscriptions = (onEvent: () => void) => {
  let unsubForeground: (() => void) | undefined;
  let unsubLifecycle: (() => void) | undefined;

  if (isTauri()) {
    listen("os:foreground-changed", () => onEvent()).then((u) => {
      unsubForeground = u;
    });
    listen("os:window-lifecycle", () => onEvent()).then((u) => {
      unsubLifecycle = u;
    });
  }

  return () => {
    unsubForeground?.();
    unsubLifecycle?.();
  };
};

export const useLiveDashboard = (): UseLiveDashboardReturn => {
  const { windows, memoryStats, isLoading, error, setError, refresh } = useDashboardData();
  const { selectedHwnds, toggleSelect, toggleSelectAll } = useDashboardSelection(windows);
  const { isStashing, executeStash } = useDashboardStash(refresh, setError);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<WindowSortOption>("memory");

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2500);
    const teardown = setupEventSubscriptions(refresh);
    return () => {
      clearInterval(interval);
      teardown();
    };
  }, [refresh]);

  const filteredWindows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return windows;
    return windows.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.process_name.toLowerCase().includes(q) ||
        String(w.process_id).includes(q)
    );
  }, [windows, searchQuery]);

  return {
    windows,
    filteredWindows,
    memoryStats,
    isLoading,
    isStashing,
    error,
    searchQuery,
    selectedHwnds,
    sortBy,
    setSearchQuery,
    setSortBy,
    toggleSelect,
    toggleSelectAll,
    refresh,
    executeStash,
    clearError: () => setError(null),
  };
};
