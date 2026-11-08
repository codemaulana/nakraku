import React, { useState } from "react";
import { Button } from "./Button";
import { WORKSPACE_PRESET_COLORS } from "./WorkspaceColorPicker";

export interface WorkspaceCreatorBarProps {
  existingNames: string[];
  onSubmit: (name: string, color: string) => Promise<boolean>;
  onCancel: () => void;
}

export const validateWorkspaceName = (
  name: string,
  existingNames: string[]
): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return "Workspace name cannot be empty";
  if (trimmed.length > 50) return "Name must be 50 characters or less";
  const duplicate = existingNames.some(
    (n) => n.toLowerCase() === trimmed.toLowerCase()
  );
  if (duplicate) return "A workspace with this name already exists";
  return null;
};

const CreatorColorPalette: React.FC<{
  selectedColor: string;
  onSelect: (c: string) => void;
}> = ({ selectedColor, onSelect }) => (
  <div className="flex items-center gap-1 px-1 bg-bg-base rounded border border-border-subtle py-1">
    {WORKSPACE_PRESET_COLORS.map((c) => (
      <button
        key={c}
        type="button"
        style={{ backgroundColor: c }}
        className={`w-3.5 h-3.5 rounded-full hover:scale-110 transition-transform ${
          selectedColor === c ? "ring-2 ring-white" : ""
        }`}
        onClick={() => onSelect(c)}
        aria-label={`Select color ${c}`}
      />
    ))}
  </div>
);

const CreatorFormActions: React.FC<{
  isSubmitting: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ isSubmitting, canSubmit, onCancel, onSubmit }) => (
  <div className="flex items-center gap-1.5">
    <Button size="sm" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
      Cancel
    </Button>
    <Button
      size="sm"
      variant="primary"
      icon="plus"
      onClick={onSubmit}
      disabled={isSubmitting || !canSubmit}
    >
      Create
    </Button>
  </div>
);

const CreatorInputRow: React.FC<{
  name: string;
  color: string;
  isSubmitting: boolean;
  onNameChange: (val: string) => void;
  onColorChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}> = ({
  name,
  color,
  isSubmitting,
  onNameChange,
  onColorChange,
  onSubmit,
  onCancel,
}) => (
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={name}
      autoFocus
      placeholder="e.g. Core Development, Rust Engine..."
      onChange={(e) => onNameChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
        else if (e.key === "Escape") onCancel();
      }}
      className="flex-1 bg-bg-base border border-border-subtle focus:border-accent-emerald text-text-primary text-xs px-2.5 py-1.5 rounded outline-none font-medium"
      aria-label="Workspace name input"
    />
    <CreatorColorPalette selectedColor={color} onSelect={onColorChange} />
    <CreatorFormActions
      isSubmitting={isSubmitting}
      canSubmit={Boolean(name.trim())}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  </div>
);

export const WorkspaceCreatorBar: React.FC<WorkspaceCreatorBarProps> = ({
  existingNames,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(WORKSPACE_PRESET_COLORS[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const err = validateWorkspaceName(name, existingNames);
    if (err) return setValidationError(err);
    setValidationError(null);
    setIsSubmitting(true);
    const success = await onSubmit(name.trim(), color);
    setIsSubmitting(false);
    if (success) setName("");
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-bg-surface border border-accent-emerald/60 rounded-sm">
      <div className="flex items-center justify-between text-2xs font-mono text-text-secondary">
        <span>Create New Workspace</span>
        <span className="text-3xs text-text-disabled">Press Enter to save, Esc to cancel</span>
      </div>
      <CreatorInputRow
        name={name}
        color={color}
        isSubmitting={isSubmitting}
        onNameChange={(val) => {
          setName(val);
          if (validationError) setValidationError(null);
        }}
        onColorChange={setColor}
        onSubmit={() => void handleSubmit()}
        onCancel={onCancel}
      />
      {validationError && (
        <span className="text-3xs font-mono text-danger">{validationError}</span>
      )}
    </div>
  );
};
