import { describe, expect, it } from "vitest";
import { LicenseStatusSchema } from "../src/lib/schemas";
import {
  generateLicenseKey,
  verifyLicenseKeyOffline,
} from "../scripts/generate-license.mjs";
import {
  processPurchaseEvent,
  verifyWebhookSignature,
} from "../scripts/license-webhook.mjs";
import crypto from "node:crypto";

const TEST_MID = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";

describe("License Schema & Cryptography", () => {
  it("validates LicenseStatusSchema correctly", () => {
    const raw = {
      valid: true,
      tier: "pro",
      machine_id: TEST_MID,
      expires_at: null,
      is_pro: true,
    };
    const parsed = LicenseStatusSchema.parse(raw);
    expect(parsed.valid).toBe(true);
    expect(parsed.is_pro).toBe(true);
  });

  it("generates and verifies offline license key", () => {
    const generated = generateLicenseKey({ machineId: TEST_MID, tier: "pro" });
    expect(generated.licenseKey.startsWith("NAKRAKU.")).toBe(true);

    const verified = verifyLicenseKeyOffline(generated.licenseKey, TEST_MID);
    expect(verified.valid).toBe(true);
    expect(verified.tier).toBe("pro");
  });

  it("fails verification on machine ID mismatch", () => {
    const generated = generateLicenseKey({ machineId: TEST_MID, tier: "pro" });
    const wrongMid = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    const verified = verifyLicenseKeyOffline(generated.licenseKey, wrongMid);
    expect(verified.valid).toBe(false);
    expect(verified.error).toBe("Machine ID mismatch");
  });

  it("fails verification on expired license key", () => {
    const generated = generateLicenseKey({ machineId: TEST_MID, tier: "pro", days: -1 });
    const verified = verifyLicenseKeyOffline(generated.licenseKey, TEST_MID);
    expect(verified.valid).toBe(false);
    expect(verified.error).toBe("License expired");
  });
});

describe("License Webhook Processor", () => {
  it("verifies valid HMAC webhook signature", () => {
    const secret = "whsec_test_12345";
    const payload = JSON.stringify({ event: "order_created" });
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(payload, "invalid_sig", secret)).toBe(false);
  });

  it("processes order event and generates license key", () => {
    const mockOrder = {
      type: "order_created",
      data: {
        attributes: {
          user_email: "buyer@nakraku.app",
          custom_data: {
            machine_id: TEST_MID,
            tier: "pro",
          },
        },
      },
    };

    const result = processPurchaseEvent(mockOrder);
    expect(result.success).toBe(true);
    expect(result.email).toBe("buyer@nakraku.app");
    expect(result.tier).toBe("pro");
    expect(result.licenseKey?.startsWith("NAKRAKU.")).toBe(true);
  });

  it("fails purchase processing when machine_id is missing", () => {
    const mockOrder = {
      type: "order_created",
      data: {
        attributes: {
          user_email: "buyer@nakraku.app",
          custom_data: {},
        },
      },
    };

    const result = processPurchaseEvent(mockOrder);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing machine_id");
  });
});
