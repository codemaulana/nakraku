import { describe, it, expect } from "vitest";
import {
  AppError,
  AppErrorPayloadSchema,
} from "../src/lib/appError";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { AppSettingsSchema } from "../src/lib/schemas";
import { DEFAULT_SETTINGS } from "../src/lib/settingsDefaults";

describe("Phase 12 - AppError Construction & Schema", () => {
  it("creates typed AppError with formatted message", () => {
    const err = new AppError("Db", "Disk I/O failure");
    expect(err.name).toBe("AppError");
    expect(err.errorType).toBe("Db");
    expect(err.details).toBe("Disk I/O failure");
    expect(err.message).toBe("[Db] Disk I/O failure");
    expect(AppError.isAppError(err)).toBe(true);
    expect(AppError.isAppError(new Error("Generic"))).toBe(false);
  });

  it("parses valid payloads with AppErrorPayloadSchema across all variants", () => {
    const variants = ["Db", "Os", "Core", "License", "Ws", "Validation", "Internal"] as const;
    for (const v of variants) {
      const parsed = AppErrorPayloadSchema.parse({ type: v, details: `Error in ${v}` });
      expect(parsed.type).toBe(v);
      expect(parsed.details).toBe(`Error in ${v}`);
    }
  });

  it("rejects unknown error types in AppErrorPayloadSchema", () => {
    const invalid = { type: "NetworkUnavailable", details: "Failed" };
    expect(() => AppErrorPayloadSchema.parse(invalid)).toThrow();
  });
});

describe("Phase 12 - AppError Conversion via fromUnknown", () => {
  it("converts standard Error to AppError via fromUnknown", () => {
    const standardError = new Error("Standard exception");
    const appErr = AppError.fromUnknown(standardError);
    expect(appErr.errorType).toBe("Internal");
    expect(appErr.details).toBe("Standard exception");
  });

  it("converts JSON string to AppError via fromUnknown", () => {
    const jsonStr = JSON.stringify({ type: "License", details: "Tampered signature" });
    const parsedFromJson = AppError.fromUnknown(jsonStr);
    expect(parsedFromJson.errorType).toBe("License");
    expect(parsedFromJson.details).toBe("Tampered signature");
  });

  it("converts object payload to AppError via fromUnknown", () => {
    const rawObj = { type: "Os", details: "Access denied (5)" };
    const parsed = AppError.fromUnknown(rawObj);
    expect(parsed.errorType).toBe("Os");
    expect(parsed.details).toBe("Access denied (5)");
  });

  it("handles plain string and arbitrary values in fromUnknown", () => {
    const fromStr = AppError.fromUnknown("Simple string failure");
    expect(fromStr.errorType).toBe("Internal");
    expect(fromStr.details).toBe("Simple string failure");

    const fromNull = AppError.fromUnknown(null);
    expect(fromNull.errorType).toBe("Internal");
    expect(fromNull.details).toBe("An unknown error occurred");
  });
});

describe("Phase 12 - ErrorBoundary Lifecycle State", () => {
  it("computes derived error state on caught render exception", () => {
    const simulatedError = new Error("React render crash");
    const derived = ErrorBoundary.getDerivedStateFromError(simulatedError);
    expect(derived.hasError).toBe(true);
    expect(derived.error).toBe(simulatedError);
  });
});

describe("Phase 12 - Telemetry Opt-In Schema", () => {
  it("defaults send_anonymous_crash_reports to false", () => {
    const settings = AppSettingsSchema.parse(DEFAULT_SETTINGS);
    expect(settings.send_anonymous_crash_reports).toBe(false);
  });

  it("allows toggling crash reporting opt-in flag", () => {
    const updated = AppSettingsSchema.parse({
      ...DEFAULT_SETTINGS,
      send_anonymous_crash_reports: true,
    });
    expect(updated.send_anonymous_crash_reports).toBe(true);
  });
});
