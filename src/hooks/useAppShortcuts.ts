import { useEffect } from "react";

interface AppShortcutsConfig {
  onOpenStash: () => void;
  onFocusSearch: () => void;
  onSelectTab: (tab: string) => void;
}

const TABS = ["dashboard", "workspaces", "minimap", "gallery"] as const;

export const useAppShortcuts = ({
  onOpenStash,
  onFocusSearch,
  onSelectTab,
}: AppShortcutsConfig): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onFocusSearch();
      } else if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onOpenStash();
      } else if (e.altKey && e.key >= "1" && e.key <= "4") {
        const index = parseInt(e.key, 10) - 1;
        const target = TABS[index];
        if (target) {
          e.preventDefault();
          onSelectTab(target);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenStash, onFocusSearch, onSelectTab]);
};
