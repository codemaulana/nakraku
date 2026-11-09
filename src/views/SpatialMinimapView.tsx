import React, { useState, useEffect, useCallback } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { getLiveWindows, minimizeWindow, restoreWindow } from "../lib/osApi";
import { useToast } from "../context/ToastContext";
import type { RawWindow } from "../lib/schemas";

interface MinimapWindowItem {
  id: string;
  hwnd: string;
  title: string;
  process: string;
  pid: number;
  x: number;
  y: number;
  width: number;
  height: number;
  memoryMb: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

const FALLBACK_MINIMAP_WINDOWS: readonly MinimapWindowItem[] = [
  { id: "m1", hwnd: "0x0014023A", title: "Nakraku Stash - Visual Studio Code", process: "Code.exe", pid: 4120, x: 40, y: 40, width: 1280, height: 860, memoryMb: 642, isMinimized: false, isMaximized: false },
  { id: "m2", hwnd: "0x000E011C", title: "Tauri v2 Documentation - Brave", process: "brave.exe", pid: 8912, x: 620, y: 120, width: 1180, height: 820, memoryMb: 812, isMinimized: false, isMaximized: false },
  { id: "m3", hwnd: "0x00080512", title: "PowerShell - cargo check", process: "WindowsTerminal.exe", pid: 3340, x: 2040, y: 80, width: 1400, height: 840, memoryMb: 118, isMinimized: false, isMaximized: false },
  { id: "m4", hwnd: "0x002A093E", title: "Spotify Premium", process: "Spotify.exe", pid: 7710, x: 2220, y: 200, width: 1100, height: 700, memoryMb: 284, isMinimized: true, isMaximized: false },
];

const mapRawToMinimap = (w: RawWindow, idx: number): MinimapWindowItem => ({
  id: `${w.hwnd}-${idx}`,
  hwnd: w.hwnd,
  title: w.title || w.process_name,
  process: w.process_name,
  pid: w.process_id,
  x: w.rect.x,
  y: w.rect.y,
  width: Math.max(w.rect.width, 240),
  height: Math.max(w.rect.height, 160),
  memoryMb: Math.max(1, Math.round(w.ram_bytes / (1024 * 1024))),
  isMinimized: w.is_minimized,
  isMaximized: w.is_maximized,
});

const clampPct = (val: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, val));

const MinimapNode: React.FC<{
  win: MinimapWindowItem;
  isSelected: boolean;
  onSelect: (hwnd: string) => void;
}> = ({ win, isSelected, onSelect }) => {
  const normX = win.x < -1000 ? 80 : win.x;
  const normY = win.y < -1000 ? 60 : win.y;
  const leftPct = clampPct((normX / 3840) * 100, 1, 90);
  const topPct = clampPct((normY / 1080) * 100, 10, 82);
  const widthPct = clampPct((win.width / 3840) * 100, 8, 46);
  const heightPct = clampPct((win.height / 1080) * 100, 14, 72);

  return (
    <button
      type="button"
      onClick={() => onSelect(win.hwnd)}
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
        backgroundColor: isSelected ? "rgba(0, 230, 153, 0.16)" : "rgba(18, 23, 33, 0.86)",
        border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-strong)",
        borderRadius: "var(--radius-xs)",
        padding: "4px 6px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        cursor: "pointer",
        opacity: win.isMinimized ? 0.55 : 1,
        boxShadow: isSelected ? "0 0 12px rgba(0, 230, 153, 0.25)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {win.process}
        </span>
        <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: win.isMinimized ? "var(--status-warning)" : "var(--accent-primary)" }}>
          {win.memoryMb}MB
        </span>
      </div>
      <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {win.x},{win.y} ({win.width}×{win.height})
      </span>
    </button>
  );
};

const SpatialCanvas: React.FC<{
  windows: readonly MinimapWindowItem[];
  selectedHwnd: string | null;
  onSelect: (hwnd: string) => void;
}> = ({ windows, selectedHwnd, onSelect }) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "250px",
      backgroundColor: "var(--bg-void)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      backgroundImage:
        "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }}
  >
    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, borderLeft: "1px dashed var(--accent-border)", pointerEvents: "none" }} />
    <span style={{ position: "absolute", top: 6, left: 8, fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
      DISPLAY 1 • PRIMARY (0,0 → 1920×1080)
    </span>
    <span style={{ position: "absolute", top: 6, left: "calc(50% + 8px)", fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-tertiary)" }}>
      DISPLAY 2 • EXTENDED (+1920,0 → 3840×1080)
    </span>
    {windows.map((win) => (
      <MinimapNode key={win.id} win={win} isSelected={win.hwnd === selectedHwnd} onSelect={onSelect} />
    ))}
  </div>
);

const useMinimapState = () => {
  const { showToast } = useToast();
  const [windows, setWindows] = useState<readonly MinimapWindowItem[]>(FALLBACK_MINIMAP_WINDOWS);
  const [selectedHwnd, setSelectedHwnd] = useState<string | null>(FALLBACK_MINIMAP_WINDOWS[0]?.hwnd ?? null);

  const refreshWindows = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const live = await getLiveWindows();
      if (live.length > 0) {
        const mapped = live.map(mapRawToMinimap);
        setWindows(mapped);
        setSelectedHwnd((prev) => prev ?? mapped[0]?.hwnd ?? null);
      }
    } catch {
      showToast("Failed to enumerate Win32 window coordinates.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    if (!isTauri()) return;
    getLiveWindows().then((live) => {
      if (live.length > 0) setWindows(live.map(mapRawToMinimap));
    }).catch(() => {});
  }, []);

  const handleToggleWindow = useCallback(async (win: MinimapWindowItem) => {
    if (!isTauri()) return;
    try {
      await (win.isMinimized ? restoreWindow(win.hwnd, win.isMaximized) : minimizeWindow(win.hwnd));
      showToast(`${win.isMinimized ? "Restored" : "Minimized"} ${win.process} (${win.hwnd})`, "info");
      await refreshWindows();
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    }
  }, [refreshWindows, showToast]);

  return { windows, selectedHwnd, setSelectedHwnd, refreshWindows, handleToggleWindow };
};

export const SpatialMinimapView: React.FC = () => {
  const { windows, selectedHwnd, setSelectedHwnd, refreshWindows, handleToggleWindow } = useMinimapState();
  const selectedWindow = windows.find((w) => w.hwnd === selectedHwnd) ?? windows[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ height: "36px", minHeight: "36px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="nk-section-header">SPATIAL TOPOLOGY MINIMAP</span>
          <Badge variant="active" dot>{windows.length} MAPPED</Badge>
        </div>
        <Button size="sm" variant="secondary" icon={<Icon name="restore" size={12} />} onClick={() => void refreshWindows()}>
          Rescan Geometry
        </Button>
      </div>
      <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>
        <SpatialCanvas windows={windows} selectedHwnd={selectedWindow?.hwnd ?? null} onSelect={setSelectedHwnd} />
        {selectedWindow && (
          <div className="nk-glass-panel" style={{ padding: "8px 12px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedWindow.title}
              </span>
              <span className="nk-metric" style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                {selectedWindow.process} • HWND {selectedWindow.hwnd} • PID {selectedWindow.pid} • Bounds ({selectedWindow.x}, {selectedWindow.y}) {selectedWindow.width}×{selectedWindow.height}
              </span>
            </div>
            <Button size="sm" variant="primary" onClick={() => void handleToggleWindow(selectedWindow)}>
              {selectedWindow.isMinimized ? "Restore Window" : "Minimize Window"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
