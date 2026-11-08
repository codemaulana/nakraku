import React, { useState } from "react";
import { AtomicsSection } from "./sections/AtomicsSection";
import { InputsSection } from "./sections/InputsSection";
import { LayoutsSection } from "./sections/LayoutsSection";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { MainPanel } from "../components/MainPanel";
import { Kbd } from "../components/Kbd";

export type GalleryTab = "atomics" | "inputs" | "layouts";

export interface GalleryProps {
  onClose?: () => void;
}

const TABS: { id: GalleryTab; label: string; count: number }[] = [
  { id: "atomics", label: "Atomics (Buttons, Badges, Icons)", count: 5 },
  { id: "inputs", label: "Inputs & Overlays", count: 4 },
  { id: "layouts", label: "Layout & Feedback", count: 5 },
];

const GalleryHeader: React.FC<{
  activeTab: GalleryTab;
  onSelectTab: (tab: GalleryTab) => void;
  onClose?: () => void;
}> = ({ activeTab, onSelectTab, onClose }) => (
  <div className="flex items-center justify-between px-base py-xs bg-bg-surface border-b border-border-subtle select-none">
    <div className="flex items-center gap-xs">
      <Badge variant="accent" size="sm">
        DEV QA
      </Badge>
      <span className="font-mono text-xs font-semibold text-text-primary tracking-wide">
        Component Gallery
      </span>
      <Kbd shortcut="Esc" size="xs" variant="outline" />
    </div>

    <div className="flex items-center gap-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelectTab(t.id)}
          className={`px-sm py-1 rounded-xs font-mono text-2xs transition-colors ${
            activeTab === t.id
              ? "bg-accent-emerald text-bg-base font-semibold"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>

    {onClose && (
      <Button variant="ghost" size="sm" icon="close" iconOnly onClick={onClose} aria-label="Close Gallery" />
    )}
  </div>
);

const renderActiveSection = (tab: GalleryTab) => {
  switch (tab) {
    case "atomics":
      return <AtomicsSection />;
    case "inputs":
      return <InputsSection />;
    case "layouts":
    default:
      return <LayoutsSection />;
  }
};

export const Gallery: React.FC<GalleryProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<GalleryTab>("atomics");

  return (
    <MainPanel
      noPadding
      header={
        <GalleryHeader
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onClose={onClose}
        />
      }
    >
      <div className="p-base max-w-4xl mx-auto">
        {renderActiveSection(activeTab)}
      </div>
    </MainPanel>
  );
};
