import { describe, it, expect, beforeEach } from "vitest";
import { setupMockTauri } from "../mocks/tauriMock";
import { stashNow, restoreWorkspace, ApiError } from "../../src/lib/api";

describe("Phase 14 - Stash Flow Error Handling (OS Failure)", () => {
  let mockEnv: ReturnType<typeof setupMockTauri>;

  beforeEach(() => {
    mockEnv = setupMockTauri({ failOsCalls: true });
  });

  it("handles Win32 OS enumeration failure gracefully without DB corruption", async () => {
    await expect(stashNow("ws-1", "Faulty Snapshot")).rejects.toThrow(
      ApiError
    );

    expect(mockEnv.state.sessions.length).toBe(0);
    expect(mockEnv.state.minimizedHwnds.size).toBe(0);
  });

  it("handles Win32 OS restoration failure without corrupting active workspace", async () => {
    const originalActive = mockEnv.state.workspaces.find((w) => w.is_active);
    expect(originalActive?.id).toBe("ws-1");

    await expect(restoreWorkspace("ws-2")).rejects.toThrow(ApiError);

    expect(mockEnv.state.workspaces.find((w) => w.id === "ws-1")?.is_active).toBe(
      true
    );
    expect(mockEnv.state.workspaces.find((w) => w.id === "ws-2")?.is_active).toBe(
      false
    );
  });
});
