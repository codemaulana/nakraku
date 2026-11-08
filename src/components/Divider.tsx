import React from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "subtle" | "muted" | "accent" | "danger";
export type DividerSpacing = "none" | "xs" | "sm" | "md" | "lg";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: DividerSpacing;
  label?: React.ReactNode;
  labelAlign?: "left" | "center" | "right";
  className?: string;
}

const VARIANT_BG: Record<DividerVariant, string> = {
  subtle: "bg-border-subtle",
  muted: "bg-border-muted",
  accent: "bg-accent-emerald/40",
  danger: "bg-danger/40",
};

const HORIZONTAL_SPACING: Record<DividerSpacing, string> = {
  none: "my-0",
  xs: "my-1",
  sm: "my-2",
  md: "my-3",
  lg: "my-4",
};

const VERTICAL_SPACING: Record<DividerSpacing, string> = {
  none: "mx-0",
  xs: "mx-1",
  sm: "mx-2",
  md: "mx-3",
  lg: "mx-4",
};

const resolveSpacingClass = (
  orientation: DividerOrientation,
  spacing: DividerSpacing
): string => {
  if (orientation === "vertical") {
    return VERTICAL_SPACING[spacing];
  }
  return HORIZONTAL_SPACING[spacing];
};

interface LabeledDividerProps {
  label: React.ReactNode;
  labelAlign: "left" | "center" | "right";
  colorClass: string;
  spacingClass: string;
  className: string;
}

const LabeledDivider: React.FC<LabeledDividerProps> = ({
  label,
  labelAlign,
  colorClass,
  spacingClass,
  className,
}) => {
  const lineClass = `h-[1px] ${colorClass}`;
  const isLeft = labelAlign === "left";
  const isRight = labelAlign === "right";

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`flex items-center w-full select-none ${spacingClass} ${className}`}
    >
      <div className={`${lineClass} ${isLeft ? "w-4" : "flex-1"}`} />
      <span className="font-mono text-2xs uppercase tracking-wider text-text-disabled shrink-0 px-2 leading-none select-none">
        {label}
      </span>
      <div className={`${lineClass} ${isRight ? "w-4" : "flex-1"}`} />
    </div>
  );
};

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  variant = "subtle",
  spacing = "xs",
  label,
  labelAlign = "center",
  className = "",
  ...restProps
}) => {
  const colorClass = VARIANT_BG[variant];
  const spacingClass = resolveSpacingClass(orientation, spacing);

  if (orientation === "horizontal" && label) {
    return (
      <LabeledDivider
        label={label}
        labelAlign={labelAlign}
        colorClass={colorClass}
        spacingClass={spacingClass}
        className={className}
      />
    );
  }

  const dimensionClass =
    orientation === "vertical"
      ? "w-[1px] h-full min-h-[14px] self-stretch"
      : "h-[1px] w-full";

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`shrink-0 ${dimensionClass} ${colorClass} ${spacingClass} ${className}`}
      {...restProps}
    />
  );
};
