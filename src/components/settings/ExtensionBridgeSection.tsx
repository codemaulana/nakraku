import React from "react";
import { Divider } from "../Divider";
import { Badge } from "../Badge";
import { Button } from "../Button";
import type { AppSettings } from "../../lib/schemas";

interface ExtensionBridgeSectionProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const ExtensionStatusCard: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
    <div className="flex items-center gap-sm">
      <span className="text-text-secondary">WebSocket Bridge:</span>
      <span className="text-text-primary">ws://127.0.0.1:48123</span>
    </div>
    <Badge variant={enabled ? "active" : "neutral"} dot size="sm">
      {enabled ? "LISTENING" : "STOPPED"}
    </Badge>
  </div>
);

const BrowserSupportRow: React.FC = () => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm text-2xs">
    <span className="text-text-secondary">Supported Chromium Browsers:</span>
    <div className="flex items-center gap-1 font-mono">
      <Badge variant="neutral" size="sm">Chrome 120+</Badge>
      <Badge variant="neutral" size="sm">Edge 120+</Badge>
      <Badge variant="neutral" size="sm">Brave</Badge>
    </div>
  </div>
);

export const ExtensionBridgeSection: React.FC<ExtensionBridgeSectionProps> = ({
  settings,
  onUpdate,
}) => (
  <div className="flex flex-col gap-xs">
    <Divider label="Browser Extension Loopback Bridge" labelAlign="left" spacing="none" />
    <ExtensionStatusCard enabled={settings.extension_bridge_enabled} />
    <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-text-primary">Stash Browser Tabs</span>
        <span className="text-2xs text-text-secondary">Sync open tabs into workspace snapshot via MV3 extension</span>
      </div>
      <Button
        size="sm"
        variant={settings.auto_stash_tabs ? "primary" : "secondary"}
        onClick={() => onUpdate("auto_stash_tabs", !settings.auto_stash_tabs)}
      >
        {settings.auto_stash_tabs ? "Enabled" : "Disabled"}
      </Button>
    </div>
    <BrowserSupportRow />
  </div>
);
