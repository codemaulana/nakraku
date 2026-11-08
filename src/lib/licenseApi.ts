import { safeInvoke } from "./api";
import { LicenseStatusSchema, type LicenseStatus } from "./schemas";

export const getMachineId = async (): Promise<string> => {
  const raw = await safeInvoke<string>("cmd_get_machine_id");
  return String(raw || "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90");
};

export const getLicenseStatus = async (): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_get_license_status");
  return LicenseStatusSchema.parse(raw);
};

export const activateLicense = async (licenseKey: string): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_activate_license", { licenseKey });
  return LicenseStatusSchema.parse(raw);
};

export const deactivateLicense = async (): Promise<LicenseStatus> => {
  const raw = await safeInvoke<unknown>("cmd_deactivate_license");
  return LicenseStatusSchema.parse(raw);
};
