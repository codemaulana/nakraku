import { describe, it, expect } from "vitest";

const WIN10_EXCLUDED_CLASSES = [
  "Shell_TrayWnd",
  "Progman",
  "WorkerW",
  "Windows.UI.Core.CoreWindow",
  "ApplicationFrameWindow",
];

const isWin10SystemWindow = (className: string, title: string): boolean => {
  if (WIN10_EXCLUDED_CLASSES.includes(className)) return true;
  if (!title.trim()) return true;
  return false;
};

const resolveDwmCornerPreference = (buildNumber: number): number | null => {
  const WIN11_MIN_BUILD = 22000;
  const DWMWCP_ROUND = 2;
  if (buildNumber >= WIN11_MIN_BUILD) {
    return DWMWCP_ROUND;
  }
  return null;
};

describe("Phase 14 - Windows 10 Compatibility Matrix (Build 19045 / 22H2)", () => {
  it("excludes Windows 10 UWP and shell system window classes", () => {
    expect(isWin10SystemWindow("Shell_TrayWnd", "")).toBe(true);
    expect(isWin10SystemWindow("Progman", "Program Manager")).toBe(true);
    expect(
      isWin10SystemWindow("Windows.UI.Core.CoreWindow", "Search")
    ).toBe(true);
    expect(
      isWin10SystemWindow(
        "ApplicationFrameWindow",
        "Settings"
      )
    ).toBe(true);
  });

  it("permits standard win32 desktop applications on Windows 10", () => {
    expect(
      isWin10SystemWindow(
        "Chrome_WidgetWin_1",
        "Visual Studio Code"
      )
    ).toBe(false);
    expect(
      isWin10SystemWindow("Notepad", "Untitled - Notepad")
    ).toBe(false);
  });

  it("disables DWM rounded corner preference on Windows 10 builds", () => {
    const win10Build = 19045;
    const cornerPref = resolveDwmCornerPreference(win10Build);
    expect(cornerPref).toBeNull();
  });
});
