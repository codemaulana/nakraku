import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Titlebar } from "../../src/components/Titlebar";

describe("Phase 14 - Titlebar Component Tests", () => {
  it("renders default title and drag attributes", () => {
    const { container } = render(<Titlebar />);
    expect(screen.getByText("NAKRAKU STASH")).toBeDefined();
    const header = container.querySelector("header");
    expect(header).toBeDefined();
    expect(header?.getAttribute("data-tauri-drag-region")).not.toBeNull();
  });

  it("renders custom title and badge when provided", () => {
    render(<Titlebar title="CUSTOM WORKSPACE" badge="v1.0.0-PRO" />);
    expect(screen.getByText("CUSTOM WORKSPACE")).toBeDefined();
    expect(screen.getByText("v1.0.0-PRO")).toBeDefined();
  });

  it("fires minimize callback when minimize button clicked", () => {
    const onMinimize = vi.fn();
    render(<Titlebar onMinimize={onMinimize} />);
    const btn = screen.getByLabelText("Minimize Window");
    fireEvent.click(btn);
    expect(onMinimize).toHaveBeenCalledTimes(1);
  });

  it("fires maximize callback and toggles aria label when maximized", () => {
    const onMaximize = vi.fn();
    const { rerender } = render(
      <Titlebar isMaximized={false} onMaximize={onMaximize} />
    );
    const maxBtn = screen.getByLabelText("Maximize Window");
    fireEvent.click(maxBtn);
    expect(onMaximize).toHaveBeenCalledTimes(1);

    rerender(<Titlebar isMaximized={true} onMaximize={onMaximize} />);
    expect(screen.getByLabelText("Restore Window")).toBeDefined();
  });

  it("fires close callback when close button clicked", () => {
    const onClose = vi.fn();
    render(<Titlebar onClose={onClose} />);
    const closeBtn = screen.getByLabelText("Close Window");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
