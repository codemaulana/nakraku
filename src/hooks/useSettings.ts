import { useState, useEffect, useCallback } from "react";
import * as api from "../lib/api";
import {
  type AppSettings,
  type ExportData,
  ExportDataSchema,
} from "../lib/schemas";
import {
  DEFAULT_SETTINGS,
  parseBooleanSetting,
  parseIntervalSetting,
  parseConflictModeSetting,
  parseLicenseTierSetting,
  validateLicenseKey,
} from "../lib/settingsDefaults";

export interface UseSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  dbPath: string;
  backupPath: string | null;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  activateLicense: (key: string) => Promise<boolean>;
  backupDatabaseAction: () => Promise<string | null>;
  purgeSessionsAction: () => Promise<number>;
  exportDataAction: () => Promise<string>;
  importDataAction: (jsonStr: string) => boolean;
  resetToDefaults: () => Promise<void>;
  clearMessages: () => void;
}

const loadAllSettingsFromDb = async (): Promise<AppSettings> => {
  const [
    autostart, minToTray, closeToTray, lang,
    interval, conflict, minOnStash, bridge,
    stashTabs, tier, licenseKey,
  ] = await Promise.all([
    api.getSetting("autostart_on_boot"),
    api.getSetting("minimize_to_tray"),
    api.getSetting("close_to_tray"),
    api.getSetting("language"),
    api.getSetting("auto_snapshot_interval"),
    api.getSetting("restore_conflict_mode"),
    api.getSetting("minimize_on_stash"),
    api.getSetting("extension_bridge_enabled"),
    api.getSetting("auto_stash_tabs"),
    api.getSetting("license_tier"),
    api.getSetting("license_key"),
  ]);

  return {
    autostart_on_boot: parseBooleanSetting(autostart, DEFAULT_SETTINGS.autostart_on_boot),
    minimize_to_tray: parseBooleanSetting(minToTray, DEFAULT_SETTINGS.minimize_to_tray),
    close_to_tray: parseBooleanSetting(closeToTray, DEFAULT_SETTINGS.close_to_tray),
    language: lang ?? DEFAULT_SETTINGS.language,
    auto_snapshot_interval: parseIntervalSetting(interval, DEFAULT_SETTINGS.auto_snapshot_interval),
    restore_conflict_mode: parseConflictModeSetting(conflict, DEFAULT_SETTINGS.restore_conflict_mode),
    minimize_on_stash: parseBooleanSetting(minOnStash, DEFAULT_SETTINGS.minimize_on_stash),
    extension_bridge_enabled: parseBooleanSetting(bridge, DEFAULT_SETTINGS.extension_bridge_enabled),
    auto_stash_tabs: parseBooleanSetting(stashTabs, DEFAULT_SETTINGS.auto_stash_tabs),
    license_tier: parseLicenseTierSetting(tier, DEFAULT_SETTINGS.license_tier),
    license_key: licenseKey ?? DEFAULT_SETTINGS.license_key,
    machine_id: DEFAULT_SETTINGS.machine_id,
  };
};

const persistAllSettings = async (settings: AppSettings): Promise<void> => {
  const entries: [string, string][] = [
    ["autostart_on_boot", String(settings.autostart_on_boot)],
    ["minimize_to_tray", String(settings.minimize_to_tray)],
    ["close_to_tray", String(settings.close_to_tray)],
    ["language", settings.language],
    ["auto_snapshot_interval", settings.auto_snapshot_interval],
    ["restore_conflict_mode", settings.restore_conflict_mode],
    ["minimize_on_stash", String(settings.minimize_on_stash)],
    ["extension_bridge_enabled", String(settings.extension_bridge_enabled)],
    ["auto_stash_tabs", String(settings.auto_stash_tabs)],
    ["license_tier", settings.license_tier],
    ["license_key", settings.license_key],
  ];

  await Promise.all(entries.map(([k, v]) => api.setSetting(k, v)));
};

const useSettingsState = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dbPath, setDbPath] = useState<string>("%APPDATA%\\com.nakraku.stash\\stash.db");
  const [backupPath, setBackupPath] = useState<string | null>(null);

  return {
    settings, setSettings,
    isLoading, setIsLoading,
    error, setError,
    successMessage, setSuccessMessage,
    dbPath, setDbPath,
    backupPath, setBackupPath,
  };
};

const useSettingsUpdater = (
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>,
  setError: (e: string | null) => void,
  setSuccessMessage: (m: string | null) => void
) => {
  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      await api.setSetting(String(key), String(value));
      setSuccessMessage(`Saved ${String(key)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const activateLicense = async (key: string): Promise<boolean> => {
    if (!validateLicenseKey(key)) {
      setError("Invalid license key format. Expected NK-PRO-XXXX-XXXX");
      return false;
    }
    try {
      await api.setSetting("license_tier", "pro");
      await api.setSetting("license_key", key.trim());
      setSettings((prev) => ({ ...prev, license_tier: "pro", license_key: key.trim() }));
      setSuccessMessage("License activated: Pro Tier Unlimited unlocked!");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  return { updateSetting, activateLicense };
};

const useBackupAndPurge = (
  setError: (e: string | null) => void,
  setSuccessMessage: (m: string | null) => void,
  setBackupPath: (p: string | null) => void
) => {
  const backupDatabaseAction = async (): Promise<string | null> => {
    try {
      const res = await api.backupDatabase();
      setBackupPath(res);
      setSuccessMessage(`Database backup created: ${res}`);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    }
  };

  const purgeSessionsAction = async (): Promise<number> => {
    try {
      const count = await api.purgeAllSessions();
      setSuccessMessage(`Purged ${count} stored sessions from database`);
      return count;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return 0;
    }
  };

  return { backupDatabaseAction, purgeSessionsAction };
};

const useDataExportImport = (
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>,
  setError: (e: string | null) => void,
  setSuccessMessage: (m: string | null) => void
) => {
  const exportDataAction = async (): Promise<string> => {
    const workspaces = await api.listWorkspaces();
    const sessionsList = await Promise.all(workspaces.map((w) => api.listSessions(w.id)));
    const data: ExportData = {
      version: "0.1.0",
      exported_at: new Date().toISOString(),
      workspaces,
      sessions: sessionsList.flat(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataAction = (jsonStr: string): boolean => {
    try {
      const parsed = ExportDataSchema.parse(JSON.parse(jsonStr));
      setSuccessMessage(`Import valid: ${parsed.workspaces.length} workspaces parsed`);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON export file");
      return false;
    }
  };

  const resetToDefaults = async () => {
    try {
      await persistAllSettings(DEFAULT_SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      setSuccessMessage("Reset all settings to factory defaults");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return { exportDataAction, importDataAction, resetToDefaults };
};

export const useSettings = (): UseSettingsReturn => {
  const s = useSettingsState();
  const updaters = useSettingsUpdater(s.setSettings, s.setError, s.setSuccessMessage);
  const backupPurge = useBackupAndPurge(s.setError, s.setSuccessMessage, s.setBackupPath);
  const dataIO = useDataExportImport(s.setSettings, s.setError, s.setSuccessMessage);

  const load = useCallback(async () => {
    try {
      s.setIsLoading(true);
      const [loaded, path] = await Promise.all([loadAllSettingsFromDb(), api.getDatabasePath()]);
      s.setSettings(loaded);
      s.setDbPath(path);
      s.setError(null);
    } catch (err) {
      s.setError(err instanceof Error ? err.message : String(err));
    } finally {
      s.setIsLoading(false);
    }
  }, [s]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...s,
    ...updaters,
    ...backupPurge,
    ...dataIO,
    clearMessages: () => {
      s.setError(null);
      s.setSuccessMessage(null);
    },
  };
};
