import { useState, useCallback } from "react";

export interface VirtualListOptions {
  count: number;
  itemHeight: number;
  viewportHeight: number;
  overscan?: number;
}

export interface VirtualItem {
  index: number;
  start: number;
}

export const useVirtualList = ({
  count,
  itemHeight,
  viewportHeight,
  overscan = 4,
}: VirtualListOptions) => {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = count * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    count - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
  );

  const items: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i += 1) {
    items.push({ index: i, start: i * itemHeight });
  }

  return { totalHeight, items, onScroll };
};
