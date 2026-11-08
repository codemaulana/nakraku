import React, { useState } from "react";
import { Button } from "../Button";
import {
  checkForAppUpdate,
  installAvailableUpdate,
  type UpdateInfo,
} from "../../services/updaterService";

type UpdaterStatus = "idle" | "checking" | "available" | "downloading" | "up-to-date" | "error";

const UpdaterStatusLabel: React.FC<{
  status: UpdaterStatus;
  version?: string | null;
}> = ({ status, version }) => {
  const messages: Record<UpdaterStatus, string> = {
    idle: "Check GitHub Releases for new Nakraku versions",
    checking: "Connecting to update server...",
    "up-to-date": "Nakraku Stash is up to date",
    available: `Version v${version} is ready for installation`,
    downloading: "Downloading update bundle...",
    error: "Unable to check updates (offline or release unavailable)",
  };

  return <span className="text-2xs text-text-secondary">{messages[status]}</span>;
};

const UpdaterActionButtons: React.FC<{
  status: UpdaterStatus;
  version?: string | null;
  onCheck: () => void;
  onInstall: () => void;
}> = ({ status, version, onCheck, onInstall }) => {
  if (status === "available") {
    return (
      <Button size="sm" variant="primary" onClick={onInstall} className="font-mono text-2xs">
        Update to v{version}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={status === "checking" || status === "downloading"}
      onClick={onCheck}
      className="font-mono text-2xs"
    >
      {status === "checking" ? "Checking..." : "Check for Updates"}
    </Button>
  );
};

export const AppUpdaterRow: React.FC = () => {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const handleCheck = async () => {
    setStatus("checking");
    try {
      const info = await checkForAppUpdate();
      setUpdateInfo(info);
      setStatus(info.available ? "available" : "up-to-date");
    } catch {
      setStatus("error");
    }
  };

  const handleInstall = async () => {
    setStatus("downloading");
    const ok = await installAvailableUpdate();
    if (!ok) setStatus("error");
  };

  return (
    <div className="flex items-center justify-between p-sm bg-bg-surface border border-border-subtle rounded-sm">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-xs">
          <span className="text-xs font-medium text-text-primary">Application Updates</span>
          <span className="text-2xs font-mono text-text-muted bg-bg-base px-1.5 py-0.5 rounded border border-border-subtle">
            v{updateInfo?.currentVersion ?? "0.1.0"}
          </span>
        </div>
        <UpdaterStatusLabel status={status} version={updateInfo?.version} />
      </div>

      <div className="flex items-center gap-xs">
        <UpdaterActionButtons
          status={status}
          version={updateInfo?.version}
          onCheck={handleCheck}
          onInstall={handleInstall}
        />
      </div>
    </div>
  );
};
