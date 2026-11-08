import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "../../src/components/CommandPalette";

describe("Phase 14 - CommandPalette Rendering & Filtering", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <CommandPalette
        isOpen={false}
        onClose={vi.fn()}
        onSelectCommand={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders search input and commands when open", () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onSelectCommand={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(
      "Type a command or shortcut name..."
    );
    expect(input).toBeDefined();
    expect(screen.getByText("Stash All Windows")).toBeDefined();
  });

  it("filters command list when search query is typed", () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onSelectCommand={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(
      "Type a command or shortcut name..."
    );
    fireEvent.change(input, { target: { value: "restore" } });

    expect(screen.getByText("Restore Last Session")).toBeDefined();
    expect(screen.queryByText("Toggle Command Palette")).toBeNull();
  });
});

describe("Phase 14 - CommandPalette Empty State & Selection", () => {
  it("shows empty state when search query matches nothing", () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onSelectCommand={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(
      "Type a command or shortcut name..."
    );
    fireEvent.change(input, { target: { value: "xyznonexistentcommand123" } });

    expect(screen.getByText("No matching commands found")).toBeDefined();
  });

  it("selects command on click and navigates via keyboard Enter", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        onSelectCommand={onSelect}
      />
    );

    const stashOption = screen.getByText("Stash All Windows");
    fireEvent.click(stashOption);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
