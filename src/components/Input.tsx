import React, { useId } from "react";
import { Icon, type IconName } from "./Icon";
import { Kbd } from "./Kbd";

export type InputSize = "sm" | "md";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: string | boolean;
  size?: InputSize;
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  shortcut?: string;
  monospace?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

const renderIconSlot = (icon: IconName | React.ReactNode): React.ReactNode => {
  if (typeof icon === "string") {
    return <Icon name={icon as IconName} size={13} className="text-text-secondary" />;
  }
  return icon;
};

const resolveInputBorderClasses = (hasError: boolean): string => {
  if (hasError) {
    return "border-danger focus-within:border-danger focus-within:ring-1 focus-within:ring-danger";
  }
  return "border-border-subtle focus-within:border-accent-emerald focus-within:ring-1 focus-within:ring-accent-emerald";
};

const resolveInputStyles = (size: InputSize, hasError: boolean, disabled?: boolean) => {
  const heightClass = size === "sm" ? "h-7" : "h-8";
  const borderClasses = resolveInputBorderClasses(hasError);
  const stateClasses = disabled
    ? "opacity-40 cursor-not-allowed bg-bg-base/50"
    : "bg-bg-elevated hover:border-border-muted";
  return { heightClass, borderClasses, stateClasses };
};

const extractInputProps = (
  props: InputProps
): Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> => {
  const {
    id: _id,
    size: _size,
    label: _label,
    helperText: _helper,
    error: _err,
    leftIcon: _left,
    rightIcon: _right,
    shortcut: _sc,
    monospace: _mono,
    clearable: _cl,
    onClear: _onCl,
    containerClassName: _cc,
    className: _cn,
    ...rest
  } = props;
  return rest;
};

const InputLabel: React.FC<{ id: string; label: React.ReactNode }> = ({
  id,
  label,
}) => (
  <label
    htmlFor={id}
    className="block text-2xs font-mono font-medium text-text-secondary uppercase tracking-wider mb-1 select-none"
  >
    {label}
  </label>
);

interface TrailingSlotsProps {
  showClearButton: boolean;
  onClear?: () => void;
  rightIcon?: IconName | React.ReactNode;
  shortcut?: string;
}

const InputTrailingSlots: React.FC<TrailingSlotsProps> = ({
  showClearButton,
  onClear,
  rightIcon,
  shortcut,
}) => {
  if (showClearButton) {
    return (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear input"
        className="p-0.5 rounded-xs text-text-disabled hover:text-text-primary hover:bg-bg-hover transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-emerald"
      >
        <Icon name="close" size={11} />
      </button>
    );
  }
  return (
    <>
      {rightIcon && <span className="shrink-0">{renderIconSlot(rightIcon)}</span>}
      {shortcut && <Kbd size="xs" variant="default" shortcut={shortcut} />}
    </>
  );
};

const InputFooter: React.FC<{
  error?: string | boolean;
  helperText?: React.ReactNode;
  descId: string;
}> = ({ error, helperText, descId }) => {
  if (typeof error === "string") {
    return (
      <p id={descId} className="text-2xs text-danger font-mono mt-1 select-none">
        {error}
      </p>
    );
  }
  if (helperText) {
    return (
      <p id={descId} className="text-2xs text-text-disabled font-ui mt-1 select-none">
        {helperText}
      </p>
    );
  }
  return null;
};

interface InputFieldProps {
  inputId: string;
  descId: string;
  heightClass: string;
  borderClasses: string;
  stateClasses: string;
  fontClass: string;
  hasError: boolean;
  disabled?: boolean;
  leftIcon?: IconName | React.ReactNode;
  rightIcon?: IconName | React.ReactNode;
  shortcut?: string;
  showClear: boolean;
  onClear?: () => void;
  className: string;
  inputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">;
  inputRef: React.ForwardedRef<HTMLInputElement>;
}

const InputField: React.FC<InputFieldProps> = ({
  inputId,
  descId,
  heightClass,
  borderClasses,
  stateClasses,
  fontClass,
  hasError,
  disabled,
  leftIcon,
  rightIcon,
  shortcut,
  showClear,
  onClear,
  className,
  inputProps,
  inputRef,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && showClear && onClear) {
      e.preventDefault();
      onClear();
    }
    inputProps.onKeyDown?.(e);
  };

  return (
    <div
      className={`flex items-center px-sm gap-xs border rounded-xs transition-colors duration-100 ease-out ${heightClass} ${borderClasses} ${stateClasses}`}
    >
      {leftIcon && <span className="shrink-0">{renderIconSlot(leftIcon)}</span>}
      <input
        ref={inputRef}
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={descId}
        className={`w-full h-full bg-transparent text-xs text-text-primary placeholder:text-text-disabled outline-none leading-none select-text ${fontClass} ${className}`}
        {...inputProps}
        onKeyDown={handleKeyDown}
      />
      <InputTrailingSlots
        showClearButton={showClear}
        onClear={onClear}
        rightIcon={rightIcon}
        shortcut={shortcut}
      />
    </div>
  );
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const descId = `${inputId}-desc`;
    const fontClass = props.monospace ?? true ? "font-mono" : "font-ui";
    const hasError = Boolean(props.error);
    const { heightClass, borderClasses, stateClasses } = resolveInputStyles(
      props.size ?? "md",
      hasError,
      props.disabled
    );
    const showClear = Boolean(props.clearable && !props.disabled && props.value && props.onClear);
    const nativeInputProps = extractInputProps(props);

    return (
      <div className={`w-full flex flex-col ${props.containerClassName ?? ""}`}>
        {props.label && <InputLabel id={inputId} label={props.label} />}
        <InputField
          inputId={inputId}
          descId={descId}
          heightClass={heightClass}
          borderClasses={borderClasses}
          stateClasses={stateClasses}
          fontClass={fontClass}
          hasError={hasError}
          disabled={props.disabled}
          leftIcon={props.leftIcon}
          rightIcon={props.rightIcon}
          shortcut={props.shortcut}
          showClear={showClear}
          onClear={props.onClear}
          className={props.className ?? ""}
          inputProps={nativeInputProps}
          inputRef={ref}
        />
        <InputFooter error={props.error} helperText={props.helperText} descId={descId} />
      </div>
    );
  }
);

Input.displayName = "Input";
