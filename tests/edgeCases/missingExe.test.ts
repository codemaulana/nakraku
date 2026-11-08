import { describe, it, expect } from "vitest";

interface WindowRestoreTarget {
  hwnd: string;
  exePath: string;
  isWindowAlive: boolean;
  exeExistsOnDisk: boolean;
}

interface SimulatedRestoreResult {
  restoredCount: number;
  failedHwnds: string[];
}

const restoreWindowSet = (
  targets: WindowRestoreTarget[]
): SimulatedRestoreResult => {
  let restoredCount = 0;
  const failedHwnds: string[] = [];

  for (const target of targets) {
    if (target.isWindowAlive) {
      restoredCount += 1;
    } else if (target.exeExistsOnDisk) {
      restoredCount += 1;
    } else {
      failedHwnds.push(target.hwnd);
    }
  }

  return { restoredCount, failedHwnds };
};

describe("Phase 14 - Edge Case: Executable Deleted After Stash", () => {
  it("restores surviving windows and isolates deleted executables in failed list", () => {
    const targets: WindowRestoreTarget[] = [
      {
        hwnd: "0x4001",
        exePath: "C:\\Program Files\\App1\\app.exe",
        isWindowAlive: true,
        exeExistsOnDisk: true,
      },
      {
        hwnd: "0x4002",
        exePath: "C:\\Users\\User\\Downloads\\TemporaryTool.exe",
        isWindowAlive: false,
        exeExistsOnDisk: false,
      },
      {
        hwnd: "0x4003",
        exePath: "C:\\Program Files\\App2\\editor.exe",
        isWindowAlive: false,
        exeExistsOnDisk: true,
      },
    ];

    const result = restoreWindowSet(targets);

    expect(result.restoredCount).toBe(2);
    expect(result.failedHwnds).toEqual(["0x4002"]);
  });
});
