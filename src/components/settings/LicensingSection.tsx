import React, { useState } from "react";
import { Divider } from "../Divider";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Input } from "../Input";
import type { AppSettings } from "../../lib/schemas";

interface LicensingSectionProps {
  settings: AppSettings;
  onActivate: (key: string) => Promise<boolean>;
}

const MachineIdHeader: React.FC<{
  machineId: string;
  isPro: boolean;
}> = ({ machineId, isPro }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex items-center justify-between text-2xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary">Machine ID:</span>
        <span className="text-text-primary font-semibold">{machineId}</span>
        <button
          type="button"
          onClick={() => void handleCopyId()}
          className="text-3xs text-accent-emerald hover:underline"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <Badge variant={isPro ? "active" : "neutral"} size="sm">
        {isPro ? "PRO TIER (UNLIMITED)" : "FREE TIER (3 WORKSPACES)"}
      </Badge>
    </div>
  );
};

const LicenseActivationForm: React.FC<{
  onActivate: (key: string) => Promise<boolean>;
}> = ({ onActivate }) => {
  const [licenseInput, setLicenseInput] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async () => {
    if (!licenseInput.trim()) return;
    setIsActivating(true);
    const success = await onActivate(licenseInput.trim());
    setIsActivating(false);
    if (success) setLicenseInput("");
  };

  return (
    <div className="flex items-center gap-xs pt-1 border-t border-border-subtle/50">
      <Input
        placeholder="Paste your Ed25519 License Key (NK-PRO-XXXX-XXXX)..."
        value={licenseInput}
        onChange={(e) => setLicenseInput(e.target.value)}
        className="flex-1 font-mono text-2xs"
      />
      <Button
        size="md"
        variant="primary"
        icon="check"
        onClick={() => void handleActivate()}
        disabled={isActivating || !licenseInput.trim()}
      >
        {isActivating ? "Activating..." : "Activate"}
      </Button>
    </div>
  );
};

const ProActiveBanner: React.FC = () => (
  <div className="p-2 bg-accent-emerald/10 border border-accent-emerald/30 rounded text-3xs font-mono text-accent-emerald">
    ✓ Lifetime Pro License Active. Unlimited workspaces and priority memory-freezing unlocked.
  </div>
);

export const LicensingSection: React.FC<LicensingSectionProps> = ({
  settings,
  onActivate,
}) => {
  const isPro = settings.license_tier === "pro";

  return (
    <div className="flex flex-col gap-xs">
      <Divider label="Offline Ed25519 Cryptographic Licensing" labelAlign="left" spacing="none" />
      <div className="p-sm bg-bg-surface border border-border-subtle rounded-sm flex flex-col gap-2">
        <MachineIdHeader machineId={settings.machine_id} isPro={isPro} />
        {isPro ? <ProActiveBanner /> : <LicenseActivationForm onActivate={onActivate} />}
      </div>
    </div>
  );
};
