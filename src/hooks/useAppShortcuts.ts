import { useEffect } from "react";
import type { AppRoute } from "../lib/routes";

interface AppShortcutsConfig {
  onOpenStash: () => void;
  onFocusSearch: () => void;
  onOpenPalette: () => void;
  onSelectRoute: (route: AppRoute) => void;
  onRestoreLast?: () => void;
}

const ROUTE_NUM_MAP: Record<string, AppRoute> = {
  "1": "dashboard",
  "2": "workspaces",
  "3": "active-session",
  "4": "minimap",
};

export const useAppShortcuts = ({
  onOpenStash,
  onFocusSearch,
  onOpenPalette,
  onSelectRoute,
  onRestoreLast,
}: AppShortcutsConfig): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenPalette();
      } else if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onFocusSearch();
      } else if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "n") ||
        (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        onOpenStash();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        onRestoreLast?.();
      } else if (e.altKey && e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        onSelectRoute(ROUTE_NUM_MAP[e.key]);
      } else if (e.altKey && e.key === ",") {
        e.preventDefault();
        onSelectRoute("settings");
      } else if (e.altKey && e.key === "/") {
        e.preventDefault();
        onSelectRoute("about");
      } else if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        onSelectRoute("gallery");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenStash, onFocusSearch, onOpenPalette, onSelectRoute, onRestoreLast]);
};
