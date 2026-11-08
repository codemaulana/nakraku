import React from "react";
import { Button } from "../../components/Button";
import { Badge, type BadgeVariant } from "../../components/Badge";
import { Kbd } from "../../components/Kbd";
import { Spinner } from "../../components/Spinner";
import { Icon, type IconName } from "../../components/Icon";
import { Divider } from "../../components/Divider";

const BADGE_VARIANTS: BadgeVariant[] = [
  "active",
  "frozen",
  "warning",
  "danger",
  "accent",
  "count",
  "neutral",
];

const SAMPLE_ICONS: IconName[] = [
  "window",
  "workspaces",
  "terminal",
  "globe",
  "cpu",
  "memory",
  "stash",
  "restore",
  "search",
  "trash",
];

const ButtonsShowcase: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <span className="text-2xs font-mono text-text-secondary uppercase">
      Buttons (32px High-Density)
    </span>
    <div className="flex flex-wrap items-center gap-xs">
      <Button variant="primary" icon="stash">
        Primary Stash
      </Button>
      <Button variant="secondary" icon="restore">
        Secondary
      </Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger" icon="trash">
        Danger
      </Button>
      <Button variant="secondary" loading>
        Loading
      </Button>
      <Button variant="secondary" iconOnly icon="pin" aria-label="Pin" />
      <Button variant="primary" shortcut="Ctrl+S">
        With Key
      </Button>
    </div>
  </div>
);

const BadgesShowcase: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <span className="text-2xs font-mono text-text-secondary uppercase">
      Badges & Monospace Tags
    </span>
    <div className="flex flex-wrap items-center gap-xs">
      {BADGE_VARIANTS.map((v) => (
        <Badge key={v} variant={v} dot={v !== "neutral" && v !== "count"}>
          {v.toUpperCase()}
        </Badge>
      ))}
      <Badge variant="active" dot pulse>
        LIVE PULSE
      </Badge>
      <Badge variant="count" size="sm">
        14
      </Badge>
    </div>
  </div>
);

const KbdAndSpinnersShowcase: React.FC = () => (
  <div className="grid grid-cols-2 gap-base">
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Kbd Keycaps
      </span>
      <div className="flex flex-wrap items-center gap-xs">
        <Kbd shortcut="Ctrl+S" size="xs" variant="elevated" />
        <Kbd shortcut="Ctrl+Shift+P" size="xs" variant="default" splitKeys />
        <Kbd shortcut="Esc" size="sm" variant="outline" />
        <Kbd shortcut="Enter" size="md" variant="elevated" />
      </div>
    </div>
    <div className="flex flex-col gap-xs">
      <span className="text-2xs font-mono text-text-secondary uppercase">
        Animated Spinners
      </span>
      <div className="flex items-center gap-sm">
        <Spinner size="xs" variant="accent" />
        <Spinner size="sm" variant="secondary" />
        <Spinner size="md" variant="accent" />
        <Spinner size="lg" variant="white" />
      </div>
    </div>
  </div>
);

const IconsShowcase: React.FC = () => (
  <div className="flex flex-col gap-xs">
    <span className="text-2xs font-mono text-text-secondary uppercase">
      Icon Registry Subset (1.5 Stroke)
    </span>
    <div className="flex flex-wrap items-center gap-sm bg-bg-surface p-xs rounded-xs border border-border-subtle">
      {SAMPLE_ICONS.map((name) => (
        <div key={name} className="flex items-center gap-1 font-mono text-2xs text-text-secondary">
          <Icon name={name} size={14} className="text-text-primary" />
          <span>{name}</span>
        </div>
      ))}
    </div>
  </div>
);

export const AtomicsSection: React.FC = () => (
  <div className="flex flex-col gap-base">
    <ButtonsShowcase />
    <Divider spacing="none" />
    <BadgesShowcase />
    <Divider spacing="none" />
    <KbdAndSpinnersShowcase />
    <Divider spacing="none" />
    <IconsShowcase />
  </div>
);
