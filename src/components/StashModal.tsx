import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";

export interface StashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (sessionTag: string) => void;
}

const StashMetricsSummary: React.FC = () => (
  <div className="border border-border-subtle rounded-xs bg-bg-elevated p-xs font-mono text-2xs space-y-1">
    <div className="flex justify-between text-text-secondary">
      <span>Target Workspace:</span>
      <span className="text-accent-emerald">Dev Core</span>
    </div>
    <div className="flex justify-between text-text-secondary">
      <span>Processes to Freeze:</span>
      <span className="text-text-primary">14 active</span>
    </div>
    <div className="flex justify-between text-text-secondary">
      <span>Estimated Memory Reclaim:</span>
      <span className="text-accent-emerald">~1,842 MB</span>
    </div>
  </div>
);

export const StashModal: React.FC<StashModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [sessionTag, setSessionTag] = useState("sprint-dev-core");

  const handleConfirm = () => {
    onConfirm?.(sessionTag);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stash Current Workspace"
      description="Freeze 14 windows to free up approximately 1.8 GB of system RAM."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm Stash
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-sm">
        <Input
          label="Session Snapshot Tag"
          placeholder="e.g. dev-core-sprint"
          value={sessionTag}
          onChange={(e) => setSessionTag(e.target.value)}
          helperText="Unique identifier for fast atomic restoration"
          leftIcon="pin"
        />
        <StashMetricsSummary />
      </div>
    </Modal>
  );
};
