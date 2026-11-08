import React, { useState } from "react";
import { Icon } from "./Icon";
import type { Workspace } from "../lib/schemas";

export const WORKSPACE_PRESET_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#06B6D4",
  "#14B8A6",
  "#EF4444",
] as const;

export const ColorPickerPopover: React.FC<{
  currentColor: string;
  onSelectColor: (c: string) => void;
  onClose: () => void;
}> = ({ currentColor, onSelectColor, onClose }) => (
  <div
    className="absolute left-6 top-0 z-50 p-1.5 bg-bg-elevated border border-border-subtle rounded shadow-lg flex items-center gap-1.5"
    onClick={(e) => e.stopPropagation()}
  >
    {WORKSPACE_PRESET_COLORS.map((c) => (
      <button
        key={c}
        type="button"
        style={{ backgroundColor: c }}
        className={`w-3.5 h-3.5 rounded-full hover:scale-110 transition-transform ${
          currentColor === c ? "ring-2 ring-white" : ""
        }`}
        onClick={() => {
          onSelectColor(c);
          onClose();
        }}
        aria-label={`Select color ${c}`}
      />
    ))}
  </div>
);

export const ReorderChevrons: React.FC<{
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}> = ({ onMoveUp, onMoveDown }) => (
  <div className="flex flex-col text-text-disabled">
    {onMoveUp && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveUp();
        }}
        className="hover:text-text-primary p-0.5"
        aria-label="Move workspace up"
      >
        <Icon name="chevron-up" size={10} />
      </button>
    )}
    {onMoveDown && (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMoveDown();
        }}
        className="hover:text-text-primary p-0.5"
        aria-label="Move workspace down"
      >
        <Icon name="chevron-down" size={10} />
      </button>
    )}
  </div>
);

export const WorkspaceColorButton: React.FC<{
  workspace: Workspace;
  onChangeColor: (id: string, c: string) => void;
}> = ({ workspace, onChangeColor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowColorPicker(!showColorPicker);
        }}
        className="w-2.5 h-2.5 rounded-full shrink-0 hover:ring-1 hover:ring-white transition-all cursor-pointer"
        style={{ backgroundColor: workspace.color }}
        aria-label={`Change color: current ${workspace.color}`}
      />
      {showColorPicker && (
        <ColorPickerPopover
          currentColor={workspace.color}
          onSelectColor={(c) => onChangeColor(workspace.id, c)}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};
