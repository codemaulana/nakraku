import React, { useState } from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Divider } from "../components/Divider";
import { Kbd } from "../components/Kbd";

const SettingsHeader: React.FC = () => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        Settings
      </span>
      <Badge variant="neutral" size="sm">
        v0.1.0-scaffold
      </Badge>
    </div>
  </div>
);

interface ToggleItemProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleItem: React.FC<ToggleItemProps> = ({
  label,
  description,
  enabled,
  onToggle,
}) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-primary">{label}</span>
      <span className="text-2xs text-text-secondary">{description}</span>
    </div>
    <Button
      size="sm"
      variant={enabled ? "primary" : "secondary"}
      onClick={onToggle}
    >
      {enabled ? "Enabled" : "Disabled"}
    </Button>
  </div>
);

const GeneralSettingsSection: React.FC = () => {
  const [autostart, setAutostart] = useState<boolean>(true);
  const [minToTray, setMinToTray] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-xs">
      <Divider label="General & System Integration" labelAlign="left" spacing="none" />
      <ToggleItem
        label="Start on Windows Boot"
        description="Launch Nakraku minimized to system tray upon login"
        enabled={autostart}
        onToggle={() => setAutostart((p) => !p)}
      />
      <ToggleItem
        label="Minimize to System Tray"
        description="Closing the window keeps the background freeze worker active"
        enabled={minToTray}
        onToggle={() => setMinToTray((p) => !p)}
      />
    </div>
  );
};

const ExtensionBridgeSection: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <Divider label="Browser Extension Loopback Bridge" labelAlign="left" spacing="none" />
    <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
      <div className="flex items-center gap-sm">
        <span className="text-text-secondary">WebSocket Bridge:</span>
        <span className="text-text-primary">ws://127.0.0.1:48123</span>
      </div>
      <Badge variant="active" dot size="sm">
        LISTENING
      </Badge>
    </div>
  </div>
);

const ShortcutsSection: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <Divider label="Global Desktop Hotkeys" labelAlign="left" spacing="none" />
    <div className="grid grid-cols-2 gap-xs">
      <div className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between">
        <span className="text-xs text-text-secondary">Instant Stash</span>
        <Kbd shortcut="Ctrl+Shift+N" size="xs" variant="elevated" />
      </div>
      <div className="p-xs bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between">
        <span className="text-xs text-text-secondary">Quick Restore</span>
        <Kbd shortcut="Ctrl+Shift+R" size="xs" variant="elevated" />
      </div>
    </div>
  </div>
);

const DangerZoneSection: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <Divider label="Danger Zone" labelAlign="left" spacing="none" variant="danger" />
    <div className="p-sm bg-bg-surface border border-danger/40 rounded-sm flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-danger">Purge Stored Snapshots</span>
        <span className="text-2xs text-text-secondary">Deletes all saved sessions from SQLite database</span>
      </div>
      <Button size="sm" variant="danger" icon="trash">
        Purge Database
      </Button>
    </div>
  </div>
);

const LicensingSection: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState<string>("");

  return (
    <div className="flex flex-col gap-xs">
      <Divider label="Offline Ed25519 Licensing" labelAlign="left" spacing="none" />
      <div className="p-sm bg-bg-surface border border-border-subtle rounded-sm flex flex-col gap-xs">
        <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
          <span>Machine ID: SHA256-D0E1-99B4-48FA</span>
          <Badge variant="neutral" size="sm">Free Tier (3/3)</Badge>
        </div>
        <div className="flex items-center gap-xs">
          <Input
            placeholder="Paste your Ed25519 Pro License Key..."
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="flex-1"
          />
          <Button size="md" variant="primary" icon="check">
            Activate
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  return (
    <MainPanel header={<SettingsHeader />}>
      <div className="p-base flex flex-col gap-md">
        <GeneralSettingsSection />
        <ExtensionBridgeSection />
        <ShortcutsSection />
        <LicensingSection />
        <DangerZoneSection />
      </div>
    </MainPanel>
  );
};
