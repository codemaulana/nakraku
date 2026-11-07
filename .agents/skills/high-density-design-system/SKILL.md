---
name: high-density-design-system
description: Design tokens, layout principles, and component metrics for Nakraku's compact, high-density native desktop utility interface.
---

# High-Density Design System Skill

## 1. Design Philosophy
Nakraku Stash is built for power users, developers, and system administrators who value information density, precision, and speed over decorative web whitespace.

## 2. Core Metrics & Grid
- **Titlebar Height**: `38px` (frameless, with native drag region).
- **Row Height (Standard)**: `32px` (workspace rows, window table rows).
- **Row Height (Large)**: `36px` (primary action rows, header cards).
- **Status Bar Height**: `24px` (fixed at bottom).
- **Sidebar Width**: `200px` (collapsible to `48px` icon-only mode).
- **Padding**: Micro-padding (`4px`, `8px`, `12px`). Never exceed `16px` container padding.

## 3. Obsidian Dark Palette
```css
:root {
  --bg-base: #080A0E;
  --bg-surface: #0F1319;
  --bg-elevated: #161B22;
  --bg-hover: #1C232E;
  --border-subtle: #1F2633;
  --border-focus: #10B981;
  
  --accent-emerald: #10B981;
  --accent-emerald-muted: rgba(16, 185, 129, 0.15);
  
  --text-primary: #F3F4F6;
  --text-secondary: #9CA3AF;
  --text-disabled: #4B5563;
  --text-mono: #E5E7EB;
  
  --status-active: #10B981;
  --status-frozen: #3B82F6;
  --status-warning: #F59E0B;
  --status-danger: #EF4444;
}
```

## 4. Typography Hierarchy
- **UI Labels**: 11px to 13px system font (`Inter`, `Segoe UI Variable Text`).
- **Telemetry & Numbers**: 11px to 12px monospace font (`JetBrains Mono`, `Cascadia Code`).
- **Table Headers**: 10px uppercase, letter-spacing `0.05em`, color `--text-secondary`.

## 5. Anti-Slop Component Rules
- Buttons: 32px height, sharp or 4px subtle rounded corners, crisp active state.
- Lists: Virtualized rendering for >50 items to maintain 60 FPS scrolling.
- Avoid large card containers; use grouped compact tables and dividers.
