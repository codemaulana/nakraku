import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { setupMockTauri } from "../mocks/tauriMock";
import { App } from "../../src/App";

describe("Phase 14 - E2E App Launch Lifecycle", () => {
  beforeEach(() => {
    setupMockTauri();
    localStorage.clear();
  });

  it("boots app shell with titlebar, sidebar navigation, and status bar", async () => {
    render(<App />);

    expect(screen.getByText("NAKRAKU STASH")).toBeDefined();
    expect(screen.getByLabelText("Minimize Window")).toBeDefined();
    expect(screen.getByLabelText("Close Window")).toBeDefined();

    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Workspaces")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText("Stash Now")).toBeDefined();
      expect(screen.getByText("Scan")).toBeDefined();
    });
  });
});
