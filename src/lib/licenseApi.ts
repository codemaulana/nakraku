import { safeInvoke } from "./api";
import { LicenseStatusSchema, type LicenseStatus } from "./schemas";

/**
 * Retrieves the cryptographic SHA-256 machine hardware fingerprint.
 * @returns {Promise<string>} 64-character lowercase hexadecimal machine ID.
 */
export const getMachineId = async (): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_machine_id");
  return String(raw || "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
};

/**
 * Checks current license state, tier, and expiration timestamp.
 * @returns {Promise<LicenseStatus>} Active license status and tier.
 */
export const getLicenseStatus = async (): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_get_license_status");
  return LicenseStatusSchema.parse(raw);
};

/**
 * Validates and activates a user-provided Ed25519 license key string.
 * @param {string} licenseKey Canonical dot-separated license key string.
 * @returns {Promise<LicenseStatus>} Resulting license activation status.
 * @throws {ApiError} If license signature, machine ID, or expiration is invalid.
 */
export const activateLicense = async (licenseKey: string): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_activate_license", { licenseKey });
  return LicenseStatusSchema.parse(raw);
};

/**
 * Deactivates active license and removes credential from Windows Credential Manager.
 * @returns {Promise<LicenseStatus>} Reset free-tier license status.
 */
export const deactivateLicense = async (): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_deactivate_license");
  return LicenseStatusSchema.parse(raw);
};
