import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceCard } from "../../src/components/WorkspaceCard";
import type { Workspace } from "../../src/lib/schemas";

const mockWorkspace: Workspace = {
  id: "ws-test-1",
  name: "Frontend Focus",
  icon: "workspaces",
  color: "#10B981",
  sort_order: 0,
  is_active: false,
  created_at: 1700000000000,
  updated_at: 1700000000000,
};

describe("Phase 14 - WorkspaceCard Metadata Rendering", () => {
  it("renders workspace name, slot number and inactive badge", () => {
    render(
      <WorkspaceCard
        workspace={mockWorkspace}
        isActive={false}
        index={0}
        onRestore={vi.fn()}
        onOpenHistory={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        onChangeColor={vi.fn()}
      />
    );

    expect(screen.getByText("Frontend Focus")).toBeDefined();
    expect(screen.getByText(/Slot #1/u)).toBeDefined();
    expect(screen.getByText("SAVED")).toBeDefined();
    expect(screen.getByText("Alt+1")).toBeDefined();
  });
});

describe("Phase 14 - WorkspaceCard Actions & Callbacks", () => {
  it("renders active badge and triggers restore callback", () => {
    const onRestore = vi.fn();
    render(
      <WorkspaceCard
        workspace={mockWorkspace}
        isActive={true}
        index={1}
        onRestore={onRestore}
        onOpenHistory={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
        onChangeColor={vi.fn()}
      />
    );

    expect(screen.getByText("ACTIVE")).toBeDefined();
    const restoreBtn = screen.getByText("Active").closest("button");
    expect(restoreBtn).not.toBeNull();
    if (restoreBtn) fireEvent.click(restoreBtn);
    expect(onRestore).toHaveBeenCalledWith("ws-test-1");
  });

  it("triggers session history and delete callbacks", () => {
    const onOpenHistory = vi.fn();
    const onDelete = vi.fn();

    render(
      <WorkspaceCard
        workspace={mockWorkspace}
        isActive={false}
        index={0}
        onRestore={vi.fn()}
        onOpenHistory={onOpenHistory}
        onRename={vi.fn()}
        onDelete={onDelete}
        onChangeColor={vi.fn()}
      />
    );

    const historyBtn = screen.getByLabelText("View session snapshots");
    fireEvent.click(historyBtn);
    expect(onOpenHistory).toHaveBeenCalledWith(mockWorkspace);

    const deleteBtn = screen.getByLabelText("Delete workspace");
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockWorkspace);
  });
});

describe("Phase 14 - WorkspaceCard Inline Renaming", () => {
  it("enters inline editing and triggers onRename on Enter", () => {
    const onRename = vi.fn().mockResolvedValue(undefined);

    render(
      <WorkspaceCard
        workspace={mockWorkspace}
        isActive={false}
        index={0}
        onRestore={vi.fn()}
        onOpenHistory={vi.fn()}
        onRename={onRename}
        onDelete={vi.fn()}
        onChangeColor={vi.fn()}
      />
    );

    const renameBtn = screen.getByLabelText("Rename workspace");
    fireEvent.click(renameBtn);

    const input = screen.getByLabelText("Edit workspace name");
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "Refactored Core" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onRename).toHaveBeenCalledWith("ws-test-1", "Refactored Core");
  });
});
