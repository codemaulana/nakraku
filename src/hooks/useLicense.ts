import { useCallback, useEffect, useState } from "react";
import {
  activateLicense,
  deactivateLicense,
  getLicenseStatus,
  getMachineId,
} from "../lib/api";
import type { LicenseStatus } from "../lib/schemas";

const DEFAULT_STATUS: LicenseStatus = {
  valid: false,
  tier: "free",
  machine_id: "unknown",
  expires_at: null,
  is_pro: false,
};

const useLicenseState = () => {
  const [status, setStatus] = useState<LicenseStatus>(DEFAULT_STATUS);
  const [machineId, setMachineId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [mid, licStatus] = await Promise.all([getMachineId(), getLicenseStatus()]);
      setMachineId(mid);
      setStatus(licStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [mid, licStatus] = await Promise.all([getMachineId(), getLicenseStatus()]);
        if (isMounted) {
          setMachineId(mid);
          setStatus(licStatus);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { status, setStatus, machineId, isLoading, setIsLoading, error, setError, refresh };
};

/**
 * Manages offline Ed25519 licensing state, hardware machine ID, and key activation.
 * @returns {{ status: LicenseStatus; machineId: string; tier: string; isPro: boolean; expiresAt: number | null; isLoading: boolean; error: string | null; activate: (key: string) => Promise<boolean>; deactivate: () => Promise<void>; refresh: () => Promise<void> }} Active license management interface.
 */
export const useLicense = () => {
  const { status, setStatus, machineId, isLoading, setIsLoading, error, setError, refresh } =
    useLicenseState();

  const activate = useCallback(async (licenseKey: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await activateLicense(licenseKey);
      setStatus(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setStatus]);

  const deactivate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await deactivateLicense();
      setStatus(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setStatus]);

  return {
    status,
    machineId,
    tier: status.tier,
    isPro: status.is_pro,
    expiresAt: status.expires_at,
    isLoading,
    error,
    activate,
    deactivate,
    refresh,
  };
};
