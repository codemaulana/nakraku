import React, { useState } from "react";
import { Divider } from "../Divider";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { useWsBridgeStatus } from "../../hooks/useWsBridgeStatus";
import { getWsTabs } from "../../lib/api";
import type { AppSettings } from "../../lib/schemas";

interface ExtensionBridgeSectionProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const ExtensionStatusCard: React.FC<{
  enabled: boolean;
  connected: boolean;
  clientCount: number;
  port: number;
}> = ({ enabled, connected, clientCount, port }) => {
  const getBadgeVariant = () => {
    if (!enabled) return "neutral";
    return connected ? "active" : "warning";
  };

  const getStatusText = () => {
    if (!enabled) return "STOPPED";
    return connected ? `CONNECTED (${clientCount})` : "LISTENING (0)";
  };

  return (
    <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
      <div className="flex items-center gap-sm">
        <span className="text-text-secondary">WebSocket Bridge:</span>
        <span className="text-text-primary">ws://127.0.0.1:{port}</span>
      </div>
      <Badge variant={getBadgeVariant()} dot size="sm">
        {getStatusText()}
      </Badge>
    </div>
  );
};

const StashTabsToggleRow: React.FC<{
  autoStashTabs: boolean;
  onToggle: () => void;
}> = ({ autoStashTabs, onToggle }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-primary">Stash Browser Tabs</span>
      <span className="text-2xs text-text-secondary">Sync open tabs into workspace snapshot via MV3 extension</span>
    </div>
    <Button
      size="sm"
      variant={autoStashTabs ? "primary" : "secondary"}
      onClick={onToggle}
    >
      {autoStashTabs ? "Enabled" : "Disabled"}
    </Button>
  </div>
);

const BrowserSupportRow: React.FC<{
  onSyncTabs: () => void;
  syncing: boolean;
  syncMsg: string | null;
}> = ({ onSyncTabs, syncing, syncMsg }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm text-2xs">
    <div className="flex items-center gap-xs">
      <span className="text-text-secondary">Chromium:</span>
      <Badge variant="neutral" size="sm">Chrome 120+</Badge>
      <Badge variant="neutral" size="sm">Edge 120+</Badge>
      <Badge variant="neutral" size="sm">Brave</Badge>
    </div>
    <div className="flex items-center gap-xs">
      {syncMsg && <span className="text-accent-emerald font-mono">{syncMsg}</span>}
      <Button size="sm" variant="secondary" onClick={onSyncTabs} disabled={syncing}>
        {syncing ? "Syncing..." : "Sync Tabs Now"}
      </Button>
    </div>
  </div>
);

export const ExtensionBridgeSection: React.FC<ExtensionBridgeSectionProps> = ({
  settings,
  onUpdate,
}) => {
  const { connected, clientCount, port } = useWsBridgeStatus();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSyncTabs = async () => {
    setSyncing(true);
    try {
      const tabs = await getWsTabs();
      setSyncMsg(`${tabs.length} tabs synced`);
    } catch {
      setSyncMsg("Sync triggered");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-xs">
      <Divider label="Browser Extension Loopback Bridge" labelAlign="left" spacing="none" />
      <ExtensionStatusCard
        enabled={settings.extension_bridge_enabled}
        connected={connected}
        clientCount={clientCount}
        port={port}
      />
      <StashTabsToggleRow
        autoStashTabs={settings.auto_stash_tabs}
        onToggle={() => onUpdate("auto_stash_tabs", !settings.auto_stash_tabs)}
      />
      <BrowserSupportRow
        onSyncTabs={handleSyncTabs}
        syncing={syncing}
        syncMsg={syncMsg}
      />
    </div>
  );
};
