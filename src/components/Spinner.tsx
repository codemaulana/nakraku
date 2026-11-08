import React from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerVariant = "accent" | "secondary" | "current" | "white";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize | number;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
};

const resolveSpinnerPixelSize = (size: SpinnerSize | number): number => {
  if (typeof size === "number") {
    return size;
  }
  return SIZE_MAP[size] ?? 16;
};

const VARIANT_CLASSES: Record<SpinnerVariant, string> = {
  accent: "text-accent-emerald",
  secondary: "text-text-secondary",
  current: "text-current",
  white: "text-text-primary",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "accent",
  label = "Loading",
  className = "",
  ...svgProps
}) => {
  const pixelSize = resolveSpinnerPixelSize(size);
  const colorClass = VARIANT_CLASSES[variant];

  return (
    <svg
      role="status"
      aria-label={label}
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 16 16"
      fill="none"
      className={`animate-spin shrink-0 select-none ${colorClass} ${className}`}
      {...svgProps}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
