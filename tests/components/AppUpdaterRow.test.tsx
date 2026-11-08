import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppUpdaterRow } from "../../src/components/settings/AppUpdaterRow";

describe("Phase 16 - AppUpdaterRow Component Tests", () => {
  it("renders default updater row with current version", () => {
    render(<AppUpdaterRow />);
    expect(screen.getByText("Application Updates")).toBeDefined();
    expect(screen.getByText("v0.1.0")).toBeDefined();
    expect(screen.getByText("Check for Updates")).toBeDefined();
  });

  it("handles check for updates click in non-Tauri environment", async () => {
    render(<AppUpdaterRow />);
    const checkBtn = screen.getByText("Check for Updates");
    fireEvent.click(checkBtn);

    await waitFor(() => {
      expect(screen.getByText("Nakraku Stash is up to date")).toBeDefined();
    });
  });
});
