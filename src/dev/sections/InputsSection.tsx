import React, { useState } from "react";
import { Input } from "../../components/Input";
import { Tooltip } from "../../components/Tooltip";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import { Divider } from "../../components/Divider";
import { ContextMenu, useContextMenu, type ContextMenuItem } from "../../components/ContextMenu";

const SAMPLE_MENU_ITEMS: ContextMenuItem[] = [
  { id: "action1", label: "Inspect Process", icon: "search", shortcut: "Ctrl+I" },
  { id: "action2", label: "Pin to Desktop", icon: "pin", shortcut: "Alt+P" },
  { id: "sep1", separator: true },
  { id: "action3", label: "Kill Process", icon: "trash", danger: true, shortcut: "Del" },
];

const InputsShowcase: React.FC = () => {
  const [val, setVal] = useState("sprint-core-snapshot");

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Input Variants (Monospace & Focus Ring)
      </span>
      <div className="grid grid-cols-2 gap-sm">
        <Input
          label="Session Tag"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          leftIcon="pin"
          clearable
          onClear={() => setVal("")}
          helperText="Unique identifier for fast atomic restore"
        />
        <Input
          label="Error State Input"
          defaultValue="invalid:path/*"
          error="Illegal characters detected in snapshot path"
          leftIcon="alert"
        />
      </div>
    </div>
  );
};

const TooltipAndMenuShowcase: React.FC = () => {
  const { position, open, close } = useContextMenu();

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Tooltip & ContextMenu Triggers
      </span>
      <div className="flex items-center gap-sm">
        <Tooltip content="Tooltip on Top" shortcut="Ctrl+T" position="top">
          <Button variant="secondary">Hover Top</Button>
        </Tooltip>
        <Tooltip content="Tooltip on Bottom" shortcut="Ctrl+B" position="bottom">
          <Button variant="secondary">Hover Bottom</Button>
        </Tooltip>
        <div
          onContextMenu={open}
          className="px-base py-1.5 border border-dashed border-border-muted rounded-xs bg-bg-surface font-mono text-2xs text-text-secondary cursor-context-menu hover:bg-bg-hover"
        >
          Right Click This Zone
        </div>
        <ContextMenu items={SAMPLE_MENU_ITEMS} position={position} onClose={close} />
      </div>
    </div>
  );
};

const ModalShowcase: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Modal Dialog & Focus Trap
      </span>
      <div className="flex items-center gap-sm">
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Sample Modal
        </Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Visual QA Sample Dialog"
          description="Tests focus trap cycling, escape key dismissal, and backdrop overlay."
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Acknowledge
              </Button>
            </>
          }
        >
          <div className="font-mono text-2xs text-text-secondary">
            Modal body rendered inside custom ScrollArea with 4px thin scrollbar.
          </div>
        </Modal>
      </div>
    </div>
  );
};

export const InputsSection: React.FC = () => (
  <div className="flex flex-col gap-base">
    <InputsShowcase />
    <Divider spacing="none" />
    <TooltipAndMenuShowcase />
    <Divider spacing="none" />
    <ModalShowcase />
  </div>
);
