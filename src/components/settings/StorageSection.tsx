import React, { useState } from "react";
import { Divider } from "../Divider";
import { Button } from "../Button";
import { Badge } from "../Badge";

interface StorageSectionProps {
  dbPath: string;
  backupPath: string | null;
  logPath?: string;
  onBackup: () => Promise<string | null>;
}

const LogFileCard: React.FC<{ logPath?: string }> = ({ logPath }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (logPath) {
      navigator.clipboard?.writeText(logPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs mt-2">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">Rolling Application Log File:</span>
        <Badge variant="neutral" size="sm">5 MB MAX</Badge>
      </div>
      <div className="p-1.5 bg-bg-base border border-border-subtle rounded text-text-primary truncate">
        {logPath || "%APPDATA%\\com.nakraku.stash\\logs\\app.log"}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
        <span className="text-text-secondary">Diagnostic Log Output</span>
        <Button size="sm" variant="secondary" icon="copy" onClick={handleCopy}>
          {copied ? "Copied Path" : "Copy Log Path"}
        </Button>
      </div>
    </div>
  );
};

const DbFileCard: React.FC<{
  dbPath: string;
  backupPath: string | null;
  onBackup: () => Promise<string | null>;
}> = ({ dbPath, backupPath, onBackup }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    await onBackup();
    setIsBackingUp(false);
  };

  return (
    <div className="flex flex-col gap-2 p-sm bg-bg-surface border border-border-subtle rounded-sm font-mono text-2xs">
      <div className="flex items-center justify-between">
        <span className="text-text-secondary">SQLite Database File:</span>
        <div className="flex items-center gap-1.5">
          <Badge variant="active" size="sm">WAL MODE</Badge>
          <Badge variant="neutral" size="sm">ACID</Badge>
        </div>
      </div>
      <div className="p-1.5 bg-bg-base border border-border-subtle rounded text-text-primary truncate">
        {dbPath}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle/50">
        <div className="flex flex-col">
          <span className="text-text-secondary">Manual Backup Copy</span>
          {backupPath && (
            <span className="text-3xs text-accent-emerald truncate max-w-xs">
              Last backup: {backupPath}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="secondary"
          icon="workspaces"
          onClick={() => void handleBackup()}
          disabled={isBackingUp}
        >
          {isBackingUp ? "Backing up..." : "Create Backup (.bak)"}
        </Button>
      </div>
    </div>
  );
};

export const StorageSection: React.FC<StorageSectionProps> = ({
  dbPath,
  backupPath,
  logPath,
  onBackup,
}) => (
  <div className="flex flex-col gap-xs">
    <Divider label="Storage & Database Architecture" labelAlign="left" spacing="none" />
    <DbFileCard dbPath={dbPath} backupPath={backupPath} onBackup={onBackup} />
    <LogFileCard logPath={logPath} />
  </div>
);
