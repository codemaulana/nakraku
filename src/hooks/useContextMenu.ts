import React, { useState, useCallback } from "react";

export function useContextMenu<T = unknown>() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((event: React.MouseEvent, itemData?: T) => {
    event.preventDefault();
    event.stopPropagation();
    setPosition({ x: event.clientX, y: event.clientY });
    if (itemData !== undefined) {
      setData(itemData);
    }
  }, []);

  const close = useCallback(() => {
    setPosition(null);
    setData(null);
  }, []);

  return { position, data, open, close };
}
