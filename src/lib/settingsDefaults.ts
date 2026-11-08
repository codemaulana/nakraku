import {
  type AppSettings,
  AppSettingsSchema,
  type AutoSnapshotInterval,
  type RestoreConflictMode,
  type LicenseTier,
} from "./schemas";

export const DEFAULT_SETTINGS: AppSettings = {
  autostart_on_boot: true,
  minimize_to_tray: true,
  close_to_tray: true,
  language: "en-US",
  auto_snapshot_interval: "15m",
  restore_conflict_mode: "overwrite",
  minimize_on_stash: true,
  extension_bridge_enabled: true,
  auto_stash_tabs: true,
  license_tier: "free",
  license_key: "",
  machine_id: "SHA256-D0E1-99B4-48FA",
  send_anonymous_crash_reports: false,
};

export const parseBooleanSetting = (
  raw: string | null | undefined,
  fallback: boolean
): boolean => {
  if (raw === null || raw === undefined) return fallback;
  return raw === "true" || raw === "1";
};

export const parseIntervalSetting = (
  raw: string | null | undefined,
  fallback: AutoSnapshotInterval
): AutoSnapshotInterval => {
  if (raw === "off" || raw === "5m" || raw === "15m" || raw === "30m") {
    return raw;
  }
  return fallback;
};

export const parseConflictModeSetting = (
  raw: string | null | undefined,
  fallback: RestoreConflictMode
): RestoreConflictMode => {
  if (raw === "overwrite" || raw === "skip") {
    return raw;
  }
  return fallback;
};

export const parseLicenseTierSetting = (
  raw: string | null | undefined,
  fallback: LicenseTier
): LicenseTier => {
  if (raw === "free" || raw === "pro") {
    return raw;
  }
  return fallback;
};

export const validateLicenseKey = (key: string): boolean => {
  const trimmed = key.trim();
  if (trimmed.startsWith("NAKRAKU.") || trimmed.startsWith("NAKRAKU-")) {
    const normalized = trimmed.startsWith("NAKRAKU-")
      ? `NAKRAKU.${trimmed.slice(8)}`
      : trimmed;
    const parts = normalized.split(".");
    return parts.length === 3 && parts[1].length > 10 && parts[2].length > 20;
  }
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith("NK-PRO-")) return false;
  const parts = upper.split("-");
  return parts.length >= 3 && parts.every((p) => p.length >= 2);
};

export const validateSettingsObject = (settings: unknown): AppSettings => {
  return AppSettingsSchema.parse(settings);
};
