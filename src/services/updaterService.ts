import { check } from '@tauri-apps/plugin-updater';

export interface UpdateInfo {
  available: boolean;
  version: string | null;
  currentVersion: string;
  body: string | null;
  date: string | null;
}

export interface UpdateProgress {
  chunkLength: number;
  contentLength?: number;
}

const CURRENT_APP_VERSION = '0.1.0';

let cachedUpdateInstance: Awaited<ReturnType<typeof check>> | null = null;

function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function checkForAppUpdate(): Promise<UpdateInfo> {
  if (!isTauriEnvironment()) {
    return {
      available: false,
      version: null,
      currentVersion: CURRENT_APP_VERSION,
      body: null,
      date: null,
    };
  }

  try {
    const update = await check();
    cachedUpdateInstance = update;

    if (!update) {
      return {
        available: false,
        version: null,
        currentVersion: CURRENT_APP_VERSION,
        body: null,
        date: null,
      };
    }

    return {
      available: update.available,
      version: update.version,
      currentVersion: update.currentVersion,
      body: update.body ?? null,
      date: update.date ?? null,
    };
  } catch (err) {
    console.warn('[UPDATER] Failed to check for updates:', err);
    return {
      available: false,
      version: null,
      currentVersion: CURRENT_APP_VERSION,
      body: null,
      date: null,
    };
  }
}

export async function installAvailableUpdate(
  onProgress?: (progress: UpdateProgress) => void
): Promise<boolean> {
  if (!cachedUpdateInstance || !cachedUpdateInstance.available) {
    const freshCheck = await check();
    if (!freshCheck || !freshCheck.available) {
      return false;
    }
    cachedUpdateInstance = freshCheck;
  }

  try {
    let totalContentLength: number | undefined;

    await cachedUpdateInstance.downloadAndInstall((event) => {
      if (event.event === 'Started') {
        totalContentLength = event.data.contentLength;
      } else if (event.event === 'Progress' && onProgress) {
        onProgress({
          chunkLength: event.data.chunkLength,
          contentLength: totalContentLength,
        });
      }
    });
    return true;
  } catch (err) {
    console.error('[UPDATER] Installation failed:', err);
    return false;
  }
}
