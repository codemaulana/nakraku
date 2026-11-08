import { describe, it, expect, beforeEach } from "vitest";
import { setupMockTauri } from "../mocks/tauriMock";
import {
  listWorkspaces,
  getLiveWindows,
  stashNow,
  restoreWorkspace,
} from "../../src/lib/api";

describe("Phase 14 - Stash Flow Integration (Happy Path)", () => {
  let mockEnv: ReturnType<typeof setupMockTauri>;

  beforeEach(() => {
    mockEnv = setupMockTauri();
  });

  it("executes full stash and restore lifecycle atomically", async () => {
    const workspaces = await listWorkspaces();
    expect(workspaces.length).toBe(3);
    const activeWs = workspaces.find((w) => w.is_active);
    expect(activeWs?.id).toBe("ws-1");

    const liveWindows = await getLiveWindows();
    expect(liveWindows.length).toBe(2);
    expect(liveWindows[0].process_name).toBe("Code.exe");

    const stashResult = await stashNow("ws-1", "Coding Sprint Snapshot");
    expect(stashResult.workspace_id).toBe("ws-1");
    expect(stashResult.window_count).toBe(2);
    expect(stashResult.minimized_count).toBe(2);
    expect(stashResult.ram_saved_bytes).toBeGreaterThan(1000 * 1024 * 1024);

    expect(mockEnv.state.sessions.length).toBe(1);
    expect(mockEnv.state.sessions[0].name).toBe("Coding Sprint Snapshot");
    expect(mockEnv.state.minimizedHwnds.size).toBe(2);

    const restoreResult = await restoreWorkspace("ws-2");
    expect(restoreResult.workspace_id).toBe("ws-2");
    expect(restoreResult.restored_count).toBe(2);
    expect(mockEnv.state.minimizedHwnds.size).toBe(0);
    expect(
      mockEnv.state.workspaces.find((w) => w.id === "ws-2")?.is_active
    ).toBe(true);
  });
});
