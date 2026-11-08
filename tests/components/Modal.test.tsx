import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../../src/components/Modal";

describe("Phase 14 - Modal Rendering & Accessibility", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Hidden Content</div>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog with title, description, and accessibility attributes", () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        title="Delete Confirmation"
        description="Are you sure you want to delete this workspace?"
        footer={<button type="button">Confirm</button>}
      >
        <div>Permanent deletion cannot be undone.</div>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Delete Confirmation")).toBeDefined();
    expect(
      screen.getByText("Are you sure you want to delete this workspace?")
    ).toBeDefined();
    expect(screen.getByText("Confirm")).toBeDefined();
  });
});

describe("Phase 14 - Modal Dismissal Handlers", () => {
  it("triggers onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Body</div>
      </Modal>
    );

    const closeBtn = screen.getByLabelText("Close dialog");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("triggers onClose on Escape key press when enabled", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={true}>
        <div>Escape Test Body</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("respects closeOnEscape and closeOnOverlayClick false flags", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={onClose}
        closeOnEscape={false}
        closeOnOverlayClick={false}
      >
        <div>Persistent Dialog</div>
      </Modal>
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = container.querySelector("[aria-hidden='true']");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});
