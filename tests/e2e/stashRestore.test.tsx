import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setupMockTauri } from "../mocks/tauriMock";
import { App } from "../../src/App";

describe("Phase 14 - E2E Stash and Restore Full Workflow", () => {
  let mockEnv: ReturnType<typeof setupMockTauri>;

  beforeEach(() => {
    mockEnv = setupMockTauri();
    localStorage.clear();
  });

  it("stashes running windows from dashboard and restores from workspaces view", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Stash Now")).toBeDefined();
    });

    const stashBtn = screen.getByText("Stash Now").closest("button");
    expect(stashBtn).not.toBeNull();
    if (stashBtn) fireEvent.click(stashBtn);

    await waitFor(() => {
      expect(mockEnv.state.sessions.length).toBeGreaterThan(0);
    });

    const workspacesNav = screen.getByText("Workspaces").closest("button");
    expect(workspacesNav).not.toBeNull();
    if (workspacesNav) fireEvent.click(workspacesNav);

    await waitFor(() => {
      expect(screen.getByText("Workspace 2")).toBeDefined();
    });

    const restoreButtons = screen.getAllByText("Restore");
    expect(restoreButtons.length).toBeGreaterThan(0);
    const firstRestoreBtn = restoreButtons[0].closest("button");
    if (firstRestoreBtn) fireEvent.click(firstRestoreBtn);

    await waitFor(() => {
      expect(mockEnv.state.minimizedHwnds.size).toBe(0);
    });
  });
});
