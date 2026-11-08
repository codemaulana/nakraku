import { describe, it, expect, beforeEach } from "vitest";
import { setupMockTauri } from "../mocks/tauriMock";
import { createWorkspaceValidated, ApiError } from "../../src/lib/api";

describe("Phase 14 - License Gate Integration Tests", () => {
  let mockEnv: ReturnType<typeof setupMockTauri>;

  beforeEach(() => {
    mockEnv = setupMockTauri({ isPro: false });
  });

  it("blocks creation of workspace #4 on free tier", async () => {
    expect(mockEnv.state.workspaces.length).toBe(3);

    await expect(
      createWorkspaceValidated("Blocked Fourth Slot")
    ).rejects.toThrow(ApiError);

    expect(mockEnv.state.workspaces.length).toBe(3);
  });

  it("permits unlimited workspaces when pro license is activated", async () => {
    mockEnv.state.isPro = true;

    const ws4 = await createWorkspaceValidated("Pro Workspace 4", "#F59E0B");
    expect(ws4.name).toBe("Pro Workspace 4");
    expect(mockEnv.state.workspaces.length).toBe(4);

    const ws5 = await createWorkspaceValidated("Pro Workspace 5", "#EC4899");
    expect(ws5.name).toBe("Pro Workspace 5");
    expect(mockEnv.state.workspaces.length).toBe(5);
  });
});
