import React from "react";
import { MainPanel } from "../components/MainPanel";
import { Badge } from "../components/Badge";
import { useSettings } from "../hooks/useSettings";
import { GeneralSettingsSection } from "../components/settings/GeneralSettingsSection";
import { StashBehaviorSection } from "../components/settings/StashBehaviorSection";
import { ExtensionBridgeSection } from "../components/settings/ExtensionBridgeSection";
import { StorageSection } from "../components/settings/StorageSection";
import { ShortcutsSection } from "../components/settings/ShortcutsSection";
import { LicensingSection } from "../components/settings/LicensingSection";
import { DangerZoneSection } from "../components/settings/DangerZoneSection";

const SettingsHeader: React.FC<{ isPro: boolean }> = ({ isPro }) => (
  <div className="flex items-center justify-between h-row px-base">
    <div className="flex items-center gap-xs">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">
        Settings & Preferences
      </span>
      <Badge variant="neutral" size="sm">
        v0.1.0-scaffold
      </Badge>
    </div>
    <Badge variant={isPro ? "active" : "neutral"} size="sm">
      {isPro ? "PRO LICENSE" : "FREE TIER"}
    </Badge>
  </div>
);

const SettingsFeedbackBanner: React.FC<{
  error: string | null;
  successMessage: string | null;
  onDismiss: () => void;
}> = ({ error, successMessage, onDismiss }) => {
  if (!error && !successMessage) return null;

  const isError = Boolean(error);
  return (
    <div
      className={`p-2 rounded-sm flex items-center justify-between text-2xs font-mono border ${
        isError
          ? "bg-danger/10 border-danger/40 text-danger"
          : "bg-accent-emerald/10 border-accent-emerald/40 text-accent-emerald"
      }`}
    >
      <span>{error ?? successMessage}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="hover:underline text-text-primary ml-2 font-sans font-medium"
      >
        Dismiss
      </button>
    </div>
  );
};

export const SettingsView: React.FC = () => {
  const s = useSettings();
  const isPro = s.settings.license_tier === "pro";

  return (
    <MainPanel header={<SettingsHeader isPro={isPro} />}>
      <div className="p-base flex flex-col gap-md">
        <SettingsFeedbackBanner
          error={s.error}
          successMessage={s.successMessage}
          onDismiss={s.clearMessages}
        />
        <GeneralSettingsSection settings={s.settings} onUpdate={s.updateSetting} />
        <StashBehaviorSection settings={s.settings} onUpdate={s.updateSetting} />
        <ExtensionBridgeSection settings={s.settings} onUpdate={s.updateSetting} />
        <StorageSection
          dbPath={s.dbPath}
          backupPath={s.backupPath}
          onBackup={s.backupDatabaseAction}
        />
        <ShortcutsSection />
        <LicensingSection settings={s.settings} onActivate={s.activateLicense} />
        <DangerZoneSection
          onPurgeSessions={s.purgeSessionsAction}
          onExportData={s.exportDataAction}
          onImportData={s.importDataAction}
          onResetDefaults={s.resetToDefaults}
        />
      </div>
    </MainPanel>
  );
};
