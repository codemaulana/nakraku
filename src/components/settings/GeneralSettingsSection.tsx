import React from "react";
import { Divider } from "../Divider";
import { Button } from "../Button";
import { AppUpdaterRow } from "./AppUpdaterRow";
import type { AppSettings } from "../../lib/schemas";

interface GeneralSettingsSectionProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
}

const SettingToggleRow: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}> = ({ label, description, enabled, onToggle }) => (
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

const LanguageSelectorRow: React.FC<{ language: string }> = ({ language }) => (
  <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-text-primary">Interface Language</span>
      <span className="text-2xs text-text-secondary">Desktop application locale</span>
    </div>
    <span className="text-xs font-mono text-text-secondary bg-bg-base px-2 py-1 rounded border border-border-subtle">
      {language} (Default)
    </span>
  </div>
);

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  settings,
  onUpdate,
}) => (
  <div className="flex flex-col gap-xs">
    <Divider label="General & System Integration" labelAlign="left" spacing="none" />
    <SettingToggleRow
      label="Start on Windows Boot"
      description="Launch Nakraku minimized to system tray upon user login"
      enabled={settings.autostart_on_boot}
      onToggle={() => onUpdate("autostart_on_boot", !settings.autostart_on_boot)}
    />
    <SettingToggleRow
      label="Minimize to System Tray"
      description="Minimizing the window sends it to the system tray notification area"
      enabled={settings.minimize_to_tray}
      onToggle={() => onUpdate("minimize_to_tray", !settings.minimize_to_tray)}
    />
    <SettingToggleRow
      label="Close Window to Tray"
      description="Closing window hides to tray instead of quitting background workers"
      enabled={settings.close_to_tray}
      onToggle={() => onUpdate("close_to_tray", !settings.close_to_tray)}
    />
    <SettingToggleRow
      label="Send Anonymous Crash Reports"
      description="Capture local panic reports and stack traces to assist bug resolution"
      enabled={settings.send_anonymous_crash_reports}
      onToggle={() => onUpdate("send_anonymous_crash_reports", !settings.send_anonymous_crash_reports)}
    />
    <AppUpdaterRow />
    <LanguageSelectorRow language={settings.language} />
  </div>
);
