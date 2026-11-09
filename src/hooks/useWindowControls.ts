import { useCallback, useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getSetting } from "../lib/api";

export interface WindowControlsState {
  isMaximized: boolean;
  minimize: () => Promise<void>;
  toggleMaximize: () => Promise<void>;
  close: () => Promise<void>;
}

const queryMaximized = async (): Promise<boolean> => {
  if (!isTauri()) {
    return false;
  }
  try {
    return await getCurrentWindow().isMaximized();
  } catch {
    return false;
  }
};

const useWindowMaximized = (): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    queryMaximized().then(setIsMaximized).catch(() => {});

    appWindow
      .onResized(() => {
        queryMaximized().then(setIsMaximized).catch(() => {});
      })
      .then((cleanup) => {
        unlisten = cleanup;
      })
      .catch(() => {});

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  return [isMaximized, setIsMaximized];
};

export const useWindowControls = (): WindowControlsState => {
  const [isMaximized, setIsMaximized] = useWindowMaximized();

  const minimize = useCallback(async () => {
    if (isTauri()) {
      const minToTray = await getSetting("minimize_to_tray").catch(() => null);
      if (minToTray === "true" || minToTray === null) {
        await getCurrentWindow().hide().catch(() => {});
      } else {
        await getCurrentWindow().minimize().catch(() => {});
      }
    }
  }, []);

  const toggleMaximize = useCallback(async () => {
    if (!isTauri()) {
      setIsMaximized((prev) => !prev);
      return;
    }
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize().catch(() => {});
    const max = await queryMaximized();
    setIsMaximized(max);
  }, [setIsMaximized]);

  const close = useCallback(async () => {
    if (isTauri()) {
      const closeToTray = await getSetting("close_to_tray").catch(() => null);
      if (closeToTray === "true" || closeToTray === null) {
        await getCurrentWindow().hide().catch(() => {});
      } else {
        await getCurrentWindow().close().catch(() => {});
      }
    }
  }, []);

  return { isMaximized, minimize, toggleMaximize, close };
};
