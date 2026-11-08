import React from "react";
import { Divider } from "../Divider";
import { Kbd } from "../Kbd";
import { Badge } from "../Badge";

interface ShortcutDef {
  action: string;
  keys: string;
  category: "Global OS" | "App Shell" | "Navigation";
}

const SHORTCUT_REGISTRY: ShortcutDef[] = [
  { action: "Instant Stash Windows", keys: "Ctrl+Shift+N", category: "Global OS" },
  { action: "Quick Restore Session", keys: "Ctrl+Shift+R", category: "Global OS" },
  { action: "Command Palette", keys: "Ctrl+K", category: "App Shell" },
  { action: "Settings View", keys: "Ctrl+,", category: "Navigation" },
  { action: "Restore Workspace Slot", keys: "Alt+1..9", category: "Navigation" },
  { action: "Close / Dismiss Modal", keys: "Escape", category: "App Shell" },
];

export const ShortcutsSection: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <div className="flex items-center justify-between">
      <Divider label="Desktop Shortcut Registry (Read-only v1)" labelAlign="left" spacing="none" />
    </div>

    <div className="grid grid-cols-2 gap-xs">
      {SHORTCUT_REGISTRY.map((s) => (
        <div
          key={s.action}
          className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-primary">{s.action}</span>
            <Badge variant="neutral" size="sm">{s.category}</Badge>
          </div>
          <Kbd shortcut={s.keys} size="xs" variant="elevated" />
        </div>
      ))}
    </div>
  </div>
);
