export interface PlatformUpdateInfo {
  signature: string;
  url: string;
}

export interface UpdaterManifest {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Record<string, PlatformUpdateInfo>;
}

export declare function generateManifest(
  version: string,
  notes: string,
  signature: string,
  assetUrl: string,
  platform?: string
): UpdaterManifest;
