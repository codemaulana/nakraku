import React, { useState, useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { listWorkspaces } from "../lib/api";
import { getLiveWindows, stashNow } from "../lib/osApi";
import { useToast } from "../context/ToastContext";

export interface StashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (sessionTag: string) => void;
}

interface WorkspaceOption {
  id: string;
  name: string;
}

const DEFAULT_WORKSPACES: readonly WorkspaceOption[] = [
  { id: "default", name: "General" },
];

const StashMetricsSummary: React.FC<{
  workspaceName: string;
  windowCount: number;
  memoryMb: number;
}> = ({ workspaceName, windowCount, memoryMb }) => (
  <div className="border border-border-subtle rounded-xs bg-bg-elevated p-xs font-mono text-2xs space-y-1">
    <div className="flex justify-between text-text-secondary">
      <span>Target Workspace:</span>
      <span className="text-accent-emerald">{workspaceName}</span>
    </div>
    <div className="flex justify-between text-text-secondary">
      <span>Processes to Freeze:</span>
      <span className="text-text-primary">{windowCount} active</span>
    </div>
    <div className="flex justify-between text-text-secondary">
      <span>Estimated Memory Reclaim:</span>
      <span className="text-accent-emerald">~{memoryMb.toLocaleString()} MB</span>
    </div>
  </div>
);

const useStashModalData = (isOpen: boolean) => {
  const [workspaces, setWorkspaces] = useState<readonly WorkspaceOption[]>(DEFAULT_WORKSPACES);
  const [selectedWsId, setSelectedWsId] = useState("default");
  const [windowCount, setWindowCount] = useState(14);
  const [memoryMb, setMemoryMb] = useState(1842);

  useEffect(() => {
    if (!isOpen || !isTauri()) return;
    let mounted = true;
    Promise.all([listWorkspaces(), getLiveWindows()])
      .then(([wsList, liveWins]) => {
        if (!mounted) return;
        const opts = wsList.length > 0 ? wsList.map((w) => ({ id: w.id, name: w.name })) : DEFAULT_WORKSPACES;
        setWorkspaces(opts);
        setSelectedWsId(opts[0]?.id ?? "default");
        setWindowCount(liveWins.length);
        const totalBytes = liveWins.reduce((acc, w) => acc + w.ram_bytes, 0);
        setMemoryMb(Math.max(1, Math.round(totalBytes / (1024 * 1024))));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  return { workspaces, selectedWsId, setSelectedWsId, windowCount, memoryMb };
};

const StashModalFormBody: React.FC<{
  workspaces: readonly WorkspaceOption[];
  selectedWsId: string;
  onSelectWs: (id: string) => void;
  sessionTag: string;
  onChangeTag: (val: string) => void;
  targetWsName: string;
  windowCount: number;
  memoryMb: number;
}> = ({ workspaces, selectedWsId, onSelectWs, sessionTag, onChangeTag, targetWsName, windowCount, memoryMb }) => (
  <div className="flex flex-col gap-sm">
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {workspaces.map((ws) => (
        <Button key={ws.id} size="sm" variant={ws.id === selectedWsId ? "primary" : "secondary"} onClick={() => onSelectWs(ws.id)}>
          {ws.name}
        </Button>
      ))}
    </div>
    <Input
      label="Session Snapshot Tag"
      placeholder="e.g. dev-core-sprint"
      value={sessionTag}
      onChange={(e) => onChangeTag(e.target.value)}
      helperText="Unique identifier for fast atomic restoration"
      leftIcon="pin"
    />
    <StashMetricsSummary workspaceName={targetWsName} windowCount={windowCount} memoryMb={memoryMb} />
  </div>
);

export const StashModal: React.FC<StashModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { showToast } = useToast();
  const [sessionTag, setSessionTag] = useState("sprint-dev-core");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { workspaces, selectedWsId, setSelectedWsId, windowCount, memoryMb } = useStashModalData(isOpen);
  const targetWsName = workspaces.find((w) => w.id === selectedWsId)?.name ?? "General";

  const handleConfirm = async () => {
    const tag = sessionTag.trim() || `Snapshot ${new Date().toLocaleTimeString()}`;
    if (isTauri()) {
      setIsSubmitting(true);
      try {
        const res = await stashNow(selectedWsId, tag);
        showToast(`Saved ${res.window_count} windows to ${targetWsName}.`, "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : String(err), "error");
      } finally {
        setIsSubmitting(false);
      }
    }
    onConfirm?.(tag);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stash Current Workspace"
      description={`Freeze ${windowCount} windows to free up approximately ${(memoryMb / 1024).toFixed(1)} GB of system RAM.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" onClick={() => void handleConfirm()} disabled={isSubmitting}>
            {isSubmitting ? "Stashing..." : "Confirm Stash"}
          </Button>
        </>
      }
    >
      <StashModalFormBody
        workspaces={workspaces} selectedWsId={selectedWsId} onSelectWs={setSelectedWsId}
        sessionTag={sessionTag} onChangeTag={setSessionTag} targetWsName={targetWsName}
        windowCount={windowCount} memoryMb={memoryMb}
      />
    </Modal>
  );
};
