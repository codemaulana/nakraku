import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

export interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  onActivate: (key: string) => Promise<boolean>;
}

const MachineIdBox: React.FC<{ machineId: string }> = ({ machineId }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (machineId) {
      navigator.clipboard?.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-1 p-sm bg-bg-base border border-border-subtle rounded-sm font-mono text-2xs">
      <div className="flex items-center justify-between text-text-secondary">
        <span>Hardware Machine ID:</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-accent-emerald hover:underline cursor-pointer"
        >
          {copied ? "Copied!" : "Copy ID"}
        </button>
      </div>
      <span className="text-text-primary break-all select-all">{machineId || "Generating..."}</span>
    </div>
  );
};

const LicenseInputSection: React.FC<{
  keyInput: string;
  setKeyInput: (val: string) => void;
  isSubmitting: boolean;
}> = ({ keyInput, setKeyInput, isSubmitting }) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard?.readText();
      if (text) setKeyInput(text.trim());
    } catch {
      // Clipboard read fallback
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor="license-input" className="text-2xs text-text-secondary">
          License Key
        </label>
        <button
          type="button"
          onClick={handlePaste}
          className="text-2xs text-text-muted hover:text-text-primary"
        >
          Paste from clipboard
        </button>
      </div>
      <Input
        id="license-input"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="NAKRAKU.payload.signature"
        className="font-mono text-2xs"
        disabled={isSubmitting}
        autoFocus
      />
    </div>
  );
};

const LicenseFormActions: React.FC<{
  isSubmitting: boolean;
  onClose: () => void;
}> = ({ isSubmitting, onClose }) => (
  <div className="flex justify-end gap-xs pt-xs border-t border-border-subtle">
    <Button size="sm" variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button size="sm" variant="primary" type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Verifying..." : "Activate License"}
    </Button>
  </div>
);

const LicenseFormContent: React.FC<{
  machineId: string;
  keyInput: string;
  setKeyInput: (val: string) => void;
  errorMsg: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ machineId, keyInput, setKeyInput, errorMsg, isSubmitting, onClose, onSubmit }) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-sm text-xs">
    <span className="text-text-secondary">
      Enter your offline Ed25519 license key. The key is cryptographically verified on-device.
    </span>

    <MachineIdBox machineId={machineId} />

    <LicenseInputSection
      keyInput={keyInput}
      setKeyInput={setKeyInput}
      isSubmitting={isSubmitting}
    />

    {errorMsg && (
      <div className="p-xs bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-2xs">
        {errorMsg}
      </div>
    )}

    <LicenseFormActions isSubmitting={isSubmitting} onClose={onClose} />
  </form>
);

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  machineId,
  onActivate,
}) => {
  const [keyInput, setKeyInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMsg("Please enter a valid license key");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await onActivate(keyInput.trim());
    setIsSubmitting(false);

    if (success) {
      setKeyInput("");
      onClose();
    } else {
      setErrorMsg("Verification failed. Invalid signature, wrong machine ID, or expired.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activate Nakraku Pro License" size="md">
      <LicenseFormContent
        machineId={machineId}
        keyInput={keyInput}
        setKeyInput={setKeyInput}
        errorMsg={errorMsg}
        isSubmitting={isSubmitting}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};
