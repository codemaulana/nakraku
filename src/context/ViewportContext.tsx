import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useWindowControls } from "../hooks/useWindowControls";

export type ViewportMode = "compact" | "standard" | "fullscreen";

export interface ViewportContextValue {
  mode: ViewportMode;
  isMaximized: boolean;
  isSidebarCollapsed: boolean;
  windowWidth: number;
  setMode: (mode: ViewportMode) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ViewportContext = createContext<ViewportContextValue | null>(null);

const resolveInitialMode = (width: number, isMax: boolean): ViewportMode => {
  if (isMax || width >= 1150) {
    return "fullscreen";
  }
  if (width <= 720) {
    return "compact";
  }
  return "standard";
};

const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(() =>
    typeof window === "undefined" ? 900 : window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMaximized } = useWindowControls();
  const windowWidth = useWindowWidth();
  const [userModeOverride, setUserModeOverride] = useState<ViewportMode | null>(null);
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null);

  const activeMode = useMemo<ViewportMode>(() => {
    if (userModeOverride) {
      return userModeOverride;
    }
    return resolveInitialMode(windowWidth, isMaximized);
  }, [userModeOverride, windowWidth, isMaximized]);

  const isSidebarCollapsed = userCollapsed ?? (activeMode === "compact");

  const toggleSidebar = useCallback(() => {
    setUserCollapsed((prev) => !(prev ?? (activeMode === "compact")));
  }, [activeMode]);

  const value = useMemo<ViewportContextValue>(
    () => ({
      mode: activeMode,
      isMaximized,
      isSidebarCollapsed,
      windowWidth,
      setMode: setUserModeOverride,
      toggleSidebar,
      setSidebarCollapsed: (val) => setUserCollapsed(val),
    }),
    [activeMode, isMaximized, isSidebarCollapsed, windowWidth, toggleSidebar]
  );

  return <ViewportContext.Provider value={value}>{children}</ViewportContext.Provider>;
};

export const useViewport = (): ViewportContextValue => {
  const context = useContext(ViewportContext);
  if (!context) {
    return {
      mode: "standard",
      isMaximized: false,
      isSidebarCollapsed: false,
      windowWidth: 900,
      setMode: () => {},
      toggleSidebar: () => {},
      setSidebarCollapsed: () => {},
    };
  }
  return context;
};
