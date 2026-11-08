import React from "react";

export type KbdSize = "xs" | "sm" | "md";
export type KbdVariant = "default" | "elevated" | "outline" | "ghost";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  shortcut?: string;
  size?: KbdSize;
  variant?: KbdVariant;
  splitKeys?: boolean;
}

const SIZE_CLASSES: Record<KbdSize, string> = {
  xs: "h-3.5 min-w-[14px] px-1 text-[9px]",
  sm: "h-4.5 min-w-[18px] px-1.5 text-2xs",
  md: "h-5.5 min-w-[22px] px-2 text-xs",
};

const VARIANT_CLASSES: Record<KbdVariant, string> = {
  default:
    "bg-bg-surface border-border-subtle text-text-secondary shadow-[0_1px_0_0_rgba(0,0,0,0.5)]",
  elevated:
    "bg-bg-elevated border-border-muted text-text-primary shadow-[0_1px_0_0_rgba(0,0,0,0.6)]",
  outline: "bg-transparent border-border-subtle text-text-secondary",
  ghost: "bg-transparent border-transparent text-text-disabled",
};

const resolveKbdClasses = (
  size: KbdSize,
  variant: KbdVariant,
  customClassName?: string
): string => {
  const base =
    "inline-flex items-center justify-center font-mono font-medium rounded-xs border leading-none select-none text-center tracking-tight transition-colors";
  return `${base} ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${customClassName ?? ""}`;
};

const formatAriaLabel = (text: string): string =>
  text.replace(/\+/gu, " plus ").replace(/-/gu, " dash ");

interface KeycapProps {
  label: React.ReactNode;
  className: string;
  ariaLabel?: string;
}

const Keycap: React.FC<KeycapProps> = ({ label, className, ariaLabel }) => (
  <kbd className={className} aria-label={ariaLabel}>
    {label}
  </kbd>
);

const SplitKbdGroup: React.FC<{
  shortcut: string;
  keycapClassName: string;
  size: KbdSize;
}> = ({ shortcut, keycapClassName, size }) => {
  const keys = shortcut.split("+").map((k) => k.trim());
  const separatorSize = size === "xs" ? "text-[8px]" : "text-2xs";

  return (
    <span
      className="inline-flex items-center gap-0.5 select-none"
      aria-label={formatAriaLabel(shortcut)}
    >
      {keys.map((key, index) => (
        <React.Fragment key={`${key}-${index}`}>
          {index > 0 && (
            <span
              className={`text-text-disabled font-mono ${separatorSize} px-0.5 leading-none select-none`}
              aria-hidden="true"
            >
              +
            </span>
          )}
          <Keycap label={key} className={keycapClassName} />
        </React.Fragment>
      ))}
    </span>
  );
};

export const Kbd: React.FC<KbdProps> = ({
  children,
  shortcut,
  size = "sm",
  variant = "default",
  splitKeys = false,
  className,
  "aria-label": customAriaLabel,
  ...restProps
}) => {
  const keycapClass = resolveKbdClasses(size, variant, className);

  if (shortcut && splitKeys && shortcut.includes("+")) {
    return (
      <SplitKbdGroup
        shortcut={shortcut}
        keycapClassName={keycapClass}
        size={size}
      />
    );
  }

  const content = children ?? shortcut;
  const computedAriaLabel =
    customAriaLabel ??
    (typeof content === "string" ? formatAriaLabel(content) : undefined);

  return (
    <kbd className={keycapClass} aria-label={computedAriaLabel} {...restProps}>
      {content}
    </kbd>
  );
};
