import React, { useState } from "react";
import { Divider } from "../Divider";
import { Button } from "../Button";
import { Modal } from "../Modal";

interface DangerZoneSectionProps {
  onPurgeSessions: () => Promise<number>;
  onExportData: () => Promise<string>;
  onImportData: (json: string) => boolean;
  onResetDefaults: () => Promise<void>;
}

const PurgeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Session Purge" size="sm">
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-secondary">Are you sure you want to delete all saved window snapshots? Workspaces will remain intact.</p>
      <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
        <Button size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button size="sm" variant="danger" icon="trash" onClick={onConfirm}>Confirm Purge</Button>
      </div>
    </div>
  </Modal>
);

const ResetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Settings Reset" size="sm">
    <div className="flex flex-col gap-3">
      <p className="text-xs text-text-secondary">Revert all configurations to factory defaults?</p>
      <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
        <Button size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={onConfirm}>Reset</Button>
      </div>
    </div>
  </Modal>
);

const ImportModal: React.FC<{
  isOpen: boolean;
  text: string;
  onChangeText: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, text, onChangeText, onClose, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Import Backup JSON" size="md">
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Paste exported JSON content here..."
        className="w-full h-32 p-2 bg-bg-base border border-border-subtle rounded text-2xs font-mono text-text-primary outline-none focus:border-accent-emerald"
      />
      <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
        <Button size="sm" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button size="sm" variant="primary" onClick={onConfirm} disabled={!text.trim()}>Verify & Import</Button>
      </div>
    </div>
  </Modal>
);

const DangerZoneRows: React.FC<{
  onOpenPurge: () => void;
  onOpenReset: () => void;
  onOpenImport: () => void;
  onExport: () => void;
}> = ({ onOpenPurge, onOpenReset, onOpenImport, onExport }) => (
  <>
    <div className="p-sm bg-bg-surface border border-danger/40 rounded-sm flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-danger">Purge Stored Snapshots</span>
        <span className="text-2xs text-text-secondary">Deletes all saved window sessions and snapshots from SQLite</span>
      </div>
      <Button size="sm" variant="danger" icon="trash" onClick={onOpenPurge}>Purge Sessions</Button>
    </div>
    <div className="p-sm bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-text-primary">Data Backup & Restore</span>
        <span className="text-2xs text-text-secondary">Export or import workspaces and session metadata as JSON</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="secondary" onClick={onExport}>Export JSON</Button>
        <Button size="sm" variant="secondary" onClick={onOpenImport}>Import JSON</Button>
      </div>
    </div>
    <div className="p-sm bg-bg-surface border border-border-subtle rounded-sm flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-text-primary">Factory Reset Settings</span>
        <span className="text-2xs text-text-secondary">Revert all user preferences to clean default state</span>
      </div>
      <Button size="sm" variant="secondary" onClick={onOpenReset}>Reset Defaults</Button>
    </div>
  </>
);

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onPurgeSessions,
  onExportData,
  onImportData,
  onResetDefaults,
}) => {
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const handleExport = async () => {
    const json = await onExportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nakraku_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-xs">
      <Divider label="Danger Zone" labelAlign="left" spacing="none" variant="danger" />
      <DangerZoneRows
        onOpenPurge={() => setPurgeOpen(true)}
        onOpenReset={() => setResetOpen(true)}
        onOpenImport={() => setImportOpen(true)}
        onExport={() => void handleExport()}
      />
      <PurgeModal isOpen={purgeOpen} onClose={() => setPurgeOpen(false)} onConfirm={() => { void onPurgeSessions(); setPurgeOpen(false); }} />
      <ResetModal isOpen={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { void onResetDefaults(); setResetOpen(false); }} />
      <ImportModal isOpen={importOpen} text={jsonText} onChangeText={setJsonText} onClose={() => setImportOpen(false)} onConfirm={() => { if (onImportData(jsonText)) { setImportOpen(false); setJsonText(""); } }} />
    </div>
  );
};
