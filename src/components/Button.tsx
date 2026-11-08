import React from "react";
import { Icon, type IconName, type IconSize, resolveIconPixelSize } from "./Icon";
import { Kbd } from "./Kbd";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  icon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  shortcut?: string;
  loading?: boolean;
}

const resolveButtonDimensions = (
  size: ButtonSize,
  iconOnly: boolean
): { container: string; iconSize: IconSize } => {
  if (iconOnly) {
    switch (size) {
      case "sm":
        return { container: "w-7 h-7 p-0", iconSize: "xs" };
      case "lg":
        return { container: "w-9 h-9 p-0", iconSize: "md" };
      case "md":
      default:
        return { container: "w-8 h-8 p-0", iconSize: "sm" };
    }
  }
  switch (size) {
    case "sm":
      return { container: "h-7 px-xs text-2xs gap-1", iconSize: "xs" };
    case "lg":
      return { container: "h-9 px-base text-sm gap-2", iconSize: "md" };
    case "md":
    default:
      return { container: "h-8 px-sm text-xs gap-1.5", iconSize: "sm" };
  }
};

const resolveButtonVariantClasses = (variant: ButtonVariant): string => {
  switch (variant) {
    case "primary":
      return "bg-accent-emerald hover:bg-accent-emerald-hover text-bg-base font-semibold shadow-xs border border-accent-emerald active:brightness-95";
    case "danger":
      return "bg-danger hover:bg-red-600 text-text-primary font-medium shadow-xs border border-danger/80 active:brightness-95";
    case "ghost":
      return "bg-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-transparent active:bg-bg-active";
    case "secondary":
    default:
      return "bg-bg-elevated hover:bg-bg-hover text-text-primary border border-border-subtle active:bg-bg-active";
  }
};

const ButtonSpinner: React.FC<{ size: IconSize }> = ({ size }) => {
  const pixelSize = resolveIconPixelSize(size);
  return (
    <svg
      className="animate-spin shrink-0 text-current"
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};

const renderIconSlot = (
  icon: IconName | React.ReactNode,
  size: IconSize
): React.ReactNode => {
  if (typeof icon === "string") {
    return <Icon name={icon as IconName} size={size} />;
  }
  return icon;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      iconOnly = false,
      icon,
      rightIcon,
      shortcut,
      loading = false,
      disabled = false,
      children,
      className = "",
      type = "button",
      ...rest
    },
    ref
  ) => {
    const { container: dimensionClasses, iconSize } = resolveButtonDimensions(
      size,
      iconOnly
    );
    const variantClasses = resolveButtonVariantClasses(variant);
    const stateClasses =
      disabled || loading
        ? "opacity-40 cursor-not-allowed pointer-events-none"
        : "cursor-pointer";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-ui leading-none rounded-xs select-none transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus ${dimensionClasses} ${variantClasses} ${stateClasses} ${className}`}
        {...rest}
      >
        {loading ? (
          <ButtonSpinner size={iconSize} />
        ) : (
          icon && renderIconSlot(icon, iconSize)
        )}
        {!iconOnly && children && <span className="truncate">{children}</span>}
        {!loading && !iconOnly && rightIcon && renderIconSlot(rightIcon, iconSize)}
        {!iconOnly && shortcut && (
          <Kbd size="xs" variant="ghost" shortcut={shortcut} className="ml-auto pl-1" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
