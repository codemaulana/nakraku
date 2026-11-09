import { useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";
import type { Workspace, Session, WindowData } from "../lib/schemas";

export interface UseWorkspacesReturn {
  workspaces: Workspace[];
  activeId: string | null;
  isFreeTier: boolean;
  isLoading: boolean;
  error: string | null;
  deleteTarget: Workspace | null;
  historyTarget: Workspace | null;
  historySessions: Session[];
  expandedSessionId: string | null;
  sessionWindows: Record<string, WindowData[]>;
  isCreating: boolean;
  setIsCreating: (v: boolean) => void;
  setDeleteTarget: (ws: Workspace | null) => void;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, color?: string) => Promise<boolean>;
  renameWorkspace: (id: string, newName: string) => Promise<void>;
  confirmDelete: () => Promise<void>;
  moveWorkspace: (index: number, direction: "up" | "down") => Promise<void>;
  changeColor: (id: string, color: string) => void;
  openHistory: (ws: Workspace) => Promise<void>;
  closeHistory: () => void;
  toggleExpandSession: (sessionId: string) => Promise<void>;
  restoreSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  restoreWorkspaceAction: (id: string) => Promise<void>;
  clearError: () => void;
}

const useWorkspacesState = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isFreeTier, setIsFreeTier] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const loadWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await api.listWorkspaces();
      setWorkspaces(list);
      const lic = await api.getLicenseStatus().catch(() => null);
      if (lic) {
        setIsFreeTier(!lic.is_pro);
      } else {
        const license = await api.getSetting("license_tier");
        setIsFreeTier(license !== "pro");
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    workspaces, setWorkspaces,
    activeId, setActiveId,
    isFreeTier, isLoading,
    error, setError,
    deleteTarget, setDeleteTarget,
    isCreating, setIsCreating,
    loadWorkspaces,
  };
};

const useWorkspaceCrudActions = (
  crud: ReturnType<typeof useWorkspacesState>
) => {
  const { deleteTarget, setDeleteTarget, setError, loadWorkspaces, setIsCreating } = crud;

  const createWorkspace = async (name: string, color?: string) => {
    try {
      await api.createWorkspaceValidated(name, color);
      await loadWorkspaces();
      setIsCreating(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const renameWorkspace = async (id: string, newName: string) => {
    try {
      await api.renameWorkspace(id, newName);
      await loadWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteWorkspace(deleteTarget.id);
      setDeleteTarget(null);
      await loadWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return { createWorkspace, renameWorkspace, confirmDelete };
};

const useWorkspaceReorder = (
  crud: ReturnType<typeof useWorkspacesState>
) => {
  const { workspaces, setWorkspaces, setError, loadWorkspaces } = crud;

  const moveWorkspace = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workspaces.length) return;
    const reordered = [...workspaces];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setWorkspaces(reordered);
    try {
      await api.reorderWorkspaces(reordered.map((w) => w.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      await loadWorkspaces();
    }
  };

  return { moveWorkspace };
};

const useSessionWindows = (
  setError: (err: string | null) => void
) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sessionWindows, setSessionWindows] = useState<Record<string, WindowData[]>>({});

  const toggleExpandSession = async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
      return;
    }
    setExpandedSessionId(sessionId);
    if (!sessionWindows[sessionId]) {
      try {
        const windows = await api.getSessionWindows(sessionId);
        setSessionWindows((prev) => ({ ...prev, [sessionId]: windows }));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };

  return { expandedSessionId, sessionWindows, toggleExpandSession };
};

const useSessionHistory = (
  setError: (err: string | null) => void,
  setActiveId: (id: string | null) => void
) => {
  const [historyTarget, setHistoryTarget] = useState<Workspace | null>(null);
  const [historySessions, setHistorySessions] = useState<Session[]>([]);
  const windows = useSessionWindows(setError);

  const openHistory = async (ws: Workspace) => {
    setHistoryTarget(ws);
    try {
      const sessions = await api.listSessions(ws.id);
      setHistorySessions(sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const restoreSession = async (sessionId: string) => {
    try {
      await api.restoreSessionById(sessionId);
      if (historyTarget) setActiveId(historyTarget.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      if (historyTarget) {
        const sessions = await api.listSessions(historyTarget.id);
        setHistorySessions(sessions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return {
    historyTarget, historySessions,
    ...windows,
    openHistory, closeHistory: () => setHistoryTarget(null),
    restoreSession, deleteSession,
  };
};

export const useWorkspaces = (): UseWorkspacesReturn => {
  const crud = useWorkspacesState();
  const mut = useWorkspaceCrudActions(crud);
  const reorder = useWorkspaceReorder(crud);
  const hist = useSessionHistory(crud.setError, crud.setActiveId);
  const { loadWorkspaces } = crud;

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const changeColor = (id: string, color: string) => {
    crud.setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, color } : w))
    );
    void api.updateWorkspaceColor(id, color).catch(() => {});
  };

  const restoreWorkspaceAction = async (id: string) => {
    try {
      await api.restoreWorkspace(id);
      crud.setActiveId(id);
    } catch (err) {
      crud.setError(err instanceof Error ? err.message : String(err));
    }
  };

  return {
    ...crud,
    ...mut,
    ...reorder,
    ...hist,
    changeColor,
    restoreWorkspaceAction,
    clearError: () => crud.setError(null),
  };
};
