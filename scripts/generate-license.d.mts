export const DEFAULT_MASTER_PUB_HEX: string;
export const DEFAULT_MASTER_PRIV_HEX: string;

export interface GenerateLicenseOptions {
  machineId: string;
  tier?: string;
  days?: number;
  privateKeyHex?: string;
}

export interface GeneratedLicense {
  licenseKey: string;
  canonical: string;
  tier: string;
  machineId: string;
  expiresAt: number;
}

export function generateLicenseKey(options: GenerateLicenseOptions): GeneratedLicense;

export interface VerifyLicenseResult {
  valid: boolean;
  error?: string;
  tier?: string;
  machineId?: string;
  expiresAt?: number | null;
}

export function verifyLicenseKeyOffline(
  licenseKey: string,
  expectedMachineId?: string,
  publicKeyHex?: string
): VerifyLicenseResult;
