import { describe, it, expect } from "vitest";
import {
  DEFAULT_SETTINGS,
  parseBooleanSetting,
  parseIntervalSetting,
  parseConflictModeSetting,
  parseLicenseTierSetting,
  validateLicenseKey,
  validateSettingsObject,
} from "../src/lib/settingsDefaults";
import {
  AppSettingsSchema,
  ExportDataSchema,
  type ExportData,
} from "../src/lib/schemas";

describe("Phase 9 - Settings Defaults & Schemas", () => {
  it("validates DEFAULT_SETTINGS conforms strictly to AppSettingsSchema", () => {
    const parsed = AppSettingsSchema.parse(DEFAULT_SETTINGS);
    expect(parsed.autostart_on_boot).toBe(true);
    expect(parsed.minimize_to_tray).toBe(true);
    expect(parsed.auto_snapshot_interval).toBe("15m");
    expect(parsed.restore_conflict_mode).toBe("overwrite");
    expect(parsed.license_tier).toBe("free");
  });

  it("validates setting objects with validateSettingsObject helper", () => {
    const validated = validateSettingsObject({
      ...DEFAULT_SETTINGS,
      auto_snapshot_interval: "30m",
      license_tier: "pro",
    });
    expect(validated.auto_snapshot_interval).toBe("30m");
    expect(validated.license_tier).toBe("pro");
  });
});

describe("Phase 9 - Boolean Setting Parser", () => {
  it("parses true and false values correctly", () => {
    expect(parseBooleanSetting("true", false)).toBe(true);
    expect(parseBooleanSetting("1", false)).toBe(true);
    expect(parseBooleanSetting("false", true)).toBe(false);
    expect(parseBooleanSetting("0", true)).toBe(false);
  });

  it("falls back to default for null or undefined values", () => {
    expect(parseBooleanSetting(null, true)).toBe(true);
    expect(parseBooleanSetting(undefined, false)).toBe(false);
  });
});

describe("Phase 9 - Interval & Conflict Mode Parsers", () => {
  it("parses valid auto-snapshot intervals", () => {
    expect(parseIntervalSetting("off", "15m")).toBe("off");
    expect(parseIntervalSetting("5m", "15m")).toBe("5m");
    expect(parseIntervalSetting("15m", "off")).toBe("15m");
    expect(parseIntervalSetting("30m", "off")).toBe("30m");
    expect(parseIntervalSetting("invalid", "15m")).toBe("15m");
  });

  it("parses valid restore conflict modes", () => {
    expect(parseConflictModeSetting("overwrite", "skip")).toBe("overwrite");
    expect(parseConflictModeSetting("skip", "overwrite")).toBe("skip");
    expect(parseConflictModeSetting("invalid", "overwrite")).toBe("overwrite");
  });

  it("parses license tier settings", () => {
    expect(parseLicenseTierSetting("free", "pro")).toBe("free");
    expect(parseLicenseTierSetting("pro", "free")).toBe("pro");
    expect(parseLicenseTierSetting("unknown", "free")).toBe("free");
  });
});

describe("Phase 9 - License Key Validator", () => {
  it("accepts valid license key formats", () => {
    expect(validateLicenseKey("NK-PRO-9842-1104")).toBe(true);
    expect(validateLicenseKey("nk-pro-abcd-ef01")).toBe(true);
  });

  it("rejects invalid license key formats", () => {
    expect(validateLicenseKey("")).toBe(false);
    expect(validateLicenseKey("INVALID-KEY")).toBe(false);
    expect(validateLicenseKey("NK-FREE-1234")).toBe(false);
    expect(validateLicenseKey("NK-PRO")).toBe(false);
  });
});

describe("Phase 9 - Export & Import Data Validation", () => {
  const validExport: ExportData = {
    version: "0.1.0",
    exported_at: "2026-11-08T11:00:00.000Z",
    workspaces: [
      {
        id: "ws-1",
        name: "Dev",
        color: "#10B981",
        sort_order: 0,
        is_active: true,
        created_at: 1700000000,
        updated_at: 1700000000,
      },
    ],
    sessions: [],
  };

  it("parses valid export data payload", () => {
    const parsed = ExportDataSchema.parse(validExport);
    expect(parsed.version).toBe("0.1.0");
    expect(parsed.workspaces.length).toBe(1);
    expect(parsed.workspaces[0].name).toBe("Dev");
  });

  it("throws validation error on invalid payload", () => {
    expect(() => ExportDataSchema.parse({ invalid: true })).toThrow();
  });
});
