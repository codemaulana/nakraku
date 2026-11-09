import React, { useRef, useState } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Kbd } from "./Kbd";
import { Badge } from "./Badge";
import { Icon, type IconName } from "./Icon";
import { ScrollArea } from "./ScrollArea";
import {
  type ShortcutItem,
  fuzzySearchCommands,
} from "../lib/shortcuts";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCommand: (cmd: ShortcutItem) => void;
}

interface CommandRowProps {
  cmd: ShortcutItem;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

const CommandRow: React.FC<CommandRowProps> = ({
  cmd,
  isSelected,
  onSelect,
  onMouseEnter,
}) => {
  const activeClass = isSelected
    ? "bg-accent-emerald-muted border-l-accent-emerald text-text-primary"
    : "border-l-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary";

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`flex items-center h-row px-sm gap-xs cursor-pointer select-none border-l-2 transition-colors duration-100 ease-out text-xs ${activeClass}`}
    >
      <Icon
        name={cmd.icon as IconName}
        size="sm"
        className={isSelected ? "text-accent-emerald" : "text-text-secondary"}
      />
      <div className="flex-1 truncate">
        <span className="text-text-primary font-medium">{cmd.title}</span>
        <span className="ml-xs text-2xs text-text-disabled truncate">
          {cmd.description}
        </span>
      </div>
      <Badge variant="neutral" size="sm">
        {cmd.category}
      </Badge>
      <Kbd shortcut={cmd.shortcut} size="xs" variant="default" />
    </div>
  );
};

const handleNavKey = (
  e: React.KeyboardEvent,
  results: ShortcutItem[],
  selectedIndex: number,
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
  onSelect: (cmd: ShortcutItem) => void
) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setSelectedIndex((prev) => (prev + 1 >= results.length ? 0 : prev + 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setSelectedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
  } else if (e.key === "Enter" && results[selectedIndex]) {
    e.preventDefault();
    onSelect(results[selectedIndex]);
  }
};

interface PaletteContentProps {
  onClose: () => void;
  onSelectCommand: (cmd: ShortcutItem) => void;
}

const PaletteList: React.FC<{
  results: ShortcutItem[];
  selectedIndex: number;
  onSelect: (cmd: ShortcutItem) => void;
  setIndex: (idx: number) => void;
}> = ({ results, selectedIndex, onSelect, setIndex }) => (
  <ScrollArea className="max-h-[300px] border border-border-subtle rounded-xs overflow-hidden bg-bg-surface">
    {results.length === 0 ? (
      <div className="flex items-center justify-center h-20 text-xs text-text-disabled">
        No matching commands found
      </div>
    ) : (
      results.map((cmd, idx) => (
        <CommandRow
          key={cmd.id}
          cmd={cmd}
          isSelected={idx === selectedIndex}
          onSelect={() => onSelect(cmd)}
          onMouseEnter={() => setIndex(idx)}
        />
      ))
    )}
  </ScrollArea>
);

const CommandPaletteContent: React.FC<PaletteContentProps> = ({
  onClose,
  onSelectCommand,
}) => {
  const [query, setQuery] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = fuzzySearchCommands(query);

  const handleSelect = (cmd: ShortcutItem) => {
    onSelectCommand(cmd);
    onClose();
  };

  return (
    <div
      className="flex flex-col gap-xs p-xs"
      onKeyDown={(e) =>
        handleNavKey(e, results, selectedIndex, setSelectedIndex, handleSelect)
      }
    >
      <Input
        ref={inputRef}
        autoFocus
        leftIcon="search"
        placeholder="Type a command or shortcut name..."
        value={query}
        onKeyDown={(e) =>
          handleNavKey(e, results, selectedIndex, setSelectedIndex, handleSelect)
        }
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedIndex(0);
        }}
        clearable
        onClear={() => setQuery("")}
      />
      <PaletteList
        results={results}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        setIndex={setSelectedIndex}
      />
    </div>
  );
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectCommand,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <CommandPaletteContent
        key="active-palette"
        onClose={onClose}
        onSelectCommand={onSelectCommand}
      />
    </Modal>
  );
};
