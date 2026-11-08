import React, { useCallback, useEffect, useRef } from "react";

const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const selector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null
  );
};

const focusInitialTarget = (
  container: HTMLDivElement | null,
  initialFocusRef?: React.RefObject<HTMLElement>
) => {
  if (initialFocusRef?.current) {
    initialFocusRef.current.focus();
    return;
  }
  if (!container) {
    return;
  }
  const focusable = getFocusableElements(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    container.focus();
  }
};

const handleTabTrapping = (
  event: React.KeyboardEvent,
  container: HTMLDivElement | null
) => {
  if (event.key !== "Tab" || !container) {
    return;
  }
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

export const useFocusTrap = (
  isOpen: boolean,
  containerRef: React.RefObject<HTMLDivElement>,
  initialFocusRef?: React.RefObject<HTMLElement>
) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      return;
    }

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(
      () => focusInitialTarget(containerRef.current, initialFocusRef),
      50
    );
    return () => window.clearTimeout(timer);
  }, [isOpen, containerRef, initialFocusRef]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => handleTabTrapping(event, containerRef.current),
    [containerRef]
  );

  return { handleKeyDown };
};
