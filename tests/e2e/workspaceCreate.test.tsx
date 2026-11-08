import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setupMockTauri } from "../mocks/tauriMock";
import { ToastProvider } from "../../src/context/ToastContext";
import { WorkspacesView } from "../../src/views/WorkspacesView";
import type { Workspace } from "../../src/lib/schemas";

const INITIAL_TEST_WORKSPACES: readonly Workspace[] = [
  {
    id: "ws-1",
    name: "Workspace 1",
    icon: "workspaces",
    color: "#10B981",
    sort_order: 0,
    is_active: true,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
  {
    id: "ws-2",
    name: "Workspace 2",
    icon: "workspaces",
    color: "#3B82F6",
    sort_order: 1,
    is_active: false,
    created_at: 1700000000000,
    updated_at: 1700000000000,
  },
];

describe("Phase 14 - E2E Workspace Creation Flow", () => {
  beforeEach(() => {
    setupMockTauri({ workspaces: [...INITIAL_TEST_WORKSPACES] });
  });

  it("opens creator bar, validates input, and saves new workspace", async () => {
    render(
      <ToastProvider>
        <WorkspacesView />
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Workspace 1")).toBeDefined();
      expect(screen.getByText("Workspace 2")).toBeDefined();
    });

    const newBtn = screen.getByText("New Workspace");
    fireEvent.click(newBtn);

    const input = screen.getByLabelText("Workspace name input");
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "Backend Services" } });

    const createSubmitBtn = screen.getByText("Create");
    fireEvent.click(createSubmitBtn);

    await waitFor(() => {
      expect(screen.getByText("Backend Services")).toBeDefined();
    });
  });
});
