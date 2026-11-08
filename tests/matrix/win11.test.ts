import { describe, it, expect } from "vitest";

const DWMWA_WINDOW_CORNER_PREFERENCE = 33;
const DWMWCP_ROUND = 2;
const DWMWA_SYSTEMBACKDROP_TYPE = 38;
const DWMSBT_ACRYLIC = 3;

interface Win11DwmCapabilities {
  supportsRoundedCorners: boolean;
  supportsSystemBackdrop: boolean;
  cornerAttribute: number | null;
  cornerPreference: number | null;
  backdropAttribute: number | null;
  backdropType: number | null;
}

const resolveWin11Capabilities = (buildNumber: number): Win11DwmCapabilities => {
  const isWin11 = buildNumber >= 22000;
  const isWin11_22H2 = buildNumber >= 22621;

  return {
    supportsRoundedCorners: isWin11,
    supportsSystemBackdrop: isWin11_22H2,
    cornerAttribute: isWin11 ? DWMWA_WINDOW_CORNER_PREFERENCE : null,
    cornerPreference: isWin11 ? DWMWCP_ROUND : null,
    backdropAttribute: isWin11_22H2 ? DWMWA_SYSTEMBACKDROP_TYPE : null,
    backdropType: isWin11_22H2 ? DWMSBT_ACRYLIC : null,
  };
};

describe("Phase 14 - Windows 11 Compatibility Matrix (Build 22621+ / 23H2)", () => {
  it("enables DWM rounded corners and backdrop attributes on Windows 11 23H2", () => {
    const caps = resolveWin11Capabilities(22631);

    expect(caps.supportsRoundedCorners).toBe(true);
    expect(caps.supportsSystemBackdrop).toBe(true);
    expect(caps.cornerAttribute).toBe(33);
    expect(caps.cornerPreference).toBe(2);
    expect(caps.backdropAttribute).toBe(38);
    expect(caps.backdropType).toBe(3);
  });

  it("enables rounded corners on Windows 11 initial build 22000", () => {
    const caps = resolveWin11Capabilities(22000);

    expect(caps.supportsRoundedCorners).toBe(true);
    expect(caps.cornerAttribute).toBe(33);
    expect(caps.cornerPreference).toBe(2);
  });
});
