import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type ScrollOrientation = "vertical" | "horizontal" | "both";
export type ScrollbarSize = "thin" | "standard";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: ScrollOrientation;
  scrollbarSize?: ScrollbarSize;
  autoHide?: boolean;
  fadeDelayMs?: number;
  children: React.ReactNode;
  className?: string;
}

const resolveOverflowClasses = (orientation: ScrollOrientation): string => {
  switch (orientation) {
    case "horizontal":
      return "overflow-x-auto overflow-y-hidden";
    case "both":
      return "overflow-x-auto overflow-y-auto";
    case "vertical":
    default:
      return "overflow-y-auto overflow-x-hidden";
  }
};

const resolveScrollClasses = (
  orientation: ScrollOrientation,
  scrollbarSize: ScrollbarSize,
  autoHide: boolean,
  isScrolling: boolean,
  className?: string
): string => {
  const overflow = resolveOverflowClasses(orientation);
  const sizeClass =
    scrollbarSize === "thin" ? "scrollarea-thin" : "scrollarea-standard";
  const hideClass = autoHide ? "scrollarea-autohide" : "custom-scrollbar";
  const activeClass = isScrolling ? "is-scrolling" : "";

  return `${overflow} ${sizeClass} ${hideClass} ${activeClass} ${className ?? ""}`;
};

const useScrollIdle = (
  autoHide: boolean,
  fadeDelayMs: number,
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
) => {
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      onScroll?.(e);
      if (!autoHide) {
        return;
      }
      setIsScrolling(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, fadeDelayMs);
    },
    [autoHide, fadeDelayMs, onScroll]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { isScrolling, handleScroll };
};

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      orientation = "vertical",
      scrollbarSize = "thin",
      autoHide = true,
      fadeDelayMs = 1000,
      children,
      className,
      onScroll,
      ...restProps
    },
    ref
  ) => {
    const { isScrolling, handleScroll } = useScrollIdle(
      autoHide,
      fadeDelayMs,
      onScroll
    );

    const combinedClassName = resolveScrollClasses(
      orientation,
      scrollbarSize,
      autoHide,
      isScrolling,
      className
    );

    return (
      <div
        ref={ref}
        onScroll={handleScroll}
        className={combinedClassName}
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = "ScrollArea";
