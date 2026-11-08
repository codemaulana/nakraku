---
name: unique-desktop-design-system
description: Architectural rules, unique colorways, bespoke typography, responsive viewport modes (Fullscreen / Standard / Compact / Mini Tray-overlay), and clean code refactoring standards for Nakraku Stash without AI slop, generic SaaS colors, or bloated card designs.
---

# Unique Desktop Design System (UDDS)

## 1. Aesthetic Philosophy: "Tactical Monolith"
Nakraku Stash is an industrial-grade desktop session orchestration utility. It rejects generic "AI slop" aesthetics—such as purple-to-indigo gradient blobs, blurry floating cards, 48px web padding, and conversational placeholder text.

### Visual Invariants
1. **Zero Generic SaaS Colors**: No default Indigo (`#6366F1`) or Purple gradients. 
2. **Deep Titanium Canvas**: Deep pitch-black base (`#07090D`) with subtle cold-slate surfaces (`#0D1117`) and brushed gunmetal elevations (`#131822`).
3. **Precision Phosphor Accent**: Primary interactive signals use crisp **Terminal Phosphor Jade** (`#00F29E` / `#05FFA1`), secondary telemetry uses **Electric Cyan** (`#06B6D4`), warnings use **Tungsten Amber** (`#F59E0B`), and destructive operations use **Laser Red** (`#EF4444`).
4. **Hairline Micro-Borders**: 1px crisp borders (`#1B2230`) with razor-sharp micro-radii (2px–4px). Never puffy 16px–24px rounded corners.
5. **High Information Density**: 28px–34px row heights, compact monospace metrics, zero wasted vertical whitespace.

---

## 2. Bespoke Typography System

### Font Pairings
- **Display & Headings**: `Space Grotesk` or `Plus Jakarta Sans` (`system-ui, -apple-system, "Segoe UI Variable Display"`) — authoritative, sharp, geometric, and clean.
- **Interface & Labels**: `Inter`, `Segoe UI Variable Text`, `-apple-system, sans-serif` (`font-medium`, `tracking-tight`).
- **Telemetry, PIDs & Coordinates**: `JetBrains Mono`, `Departure Mono`, `Cascadia Code` (`tabular-nums`, `font-feature-settings: 'tnum', 'zero'`).

### Hierarchy Scale
| Token | Size | Line Height | Tracking | Weight | Target Use |
|---|---|---|---|---|---|
| `--text-2xs` | 10px | 1.0 | +0.05em | 600 | Monospace badges, status pills, table headers |
| `--text-xs` | 11px | 1.2 | normal | 500 | Metadata, PIDs, memory usage, shortcut hints |
| `--text-sm` | 12px | 1.3 | -0.01em | 400/500 | Table row items, window titles, list labels |
| `--text-md` | 13px | 1.4 | -0.01em | 500/600 | Section titles, input text, button labels |
| `--text-lg` | 15px | 1.3 | -0.02em | 600/700 | Primary view headers, modal headers |

---

## 3. Viewport Adaptability Modes

The design system natively adapts across 4 distinct window states:

```
+-------------------------------------------------------------------------------+
| Fullscreen / Maximized (> 1200px width)                                       |
| [Sidebar: 200px] | [Master Table / Workspaces: 60%] | [Inspector Pane: 40%]   |
+-------------------------------------------------------------------------------+
| Standard Desktop (720px - 1199px width)                                       |
| [Sidebar: 200px] | [Main Content Table / Views: 100%]                         |
+-------------------------------------------------------------------------------+
| Compact / Split-Screen (500px - 719px width)                                  |
| [Icon Rail: 48px] | [Streamlined List View: 100%]                             |
+-------------------------------------------------------------------------------+
| Mini Tray Overlay (< 500px or quick popup)                                    |
| [Header Titlebar] -> [Compact 28px Rows] -> [Sticky Bottom 1-Click CTA]       |
+-------------------------------------------------------------------------------+
```

### Fullscreen / Maximized Invariant
When the window is maximized (`isMaximized === true`) or screen width exceeds `1200px`, the UI expands into a **dual-column master-inspector layout**:
- Left main pane displays the primary process table or workspace cards.
- Right auxiliary pane displays the real-time memory distribution graph, active display geometry minimap, or detailed process tree.

### Compact Invariant
When width is `<= 720px`, the sidebar automatically shrinks into an icon-only 48px rail, saving 152px of horizontal real-estate.

---

## 4. Color Palette Specifications

```css
:root {
  /* Tactical Void Canvas */
  --bg-void: #07090D;
  --bg-surface: #0D1117;
  --bg-surface-glass: rgba(13, 17, 23, 0.85);
  --bg-elevated: #131822;
  --bg-card: #161D2A;
  --bg-hover: #1A2230;
  --bg-active: #212B3D;

  /* Brushed Gunmetal Borders */
  --border-hairline: #1B2230;
  --border-muted: #141A24;
  --border-active: #2A364C;
  --border-focus: #00F29E;

  /* Phosphor Terminal Accents */
  --accent-phosphor: #00F29E;
  --accent-phosphor-glow: rgba(0, 242, 158, 0.25);
  --accent-phosphor-dim: rgba(0, 242, 158, 0.12);
  --accent-cyan: #06B6D4;
  --accent-cyan-dim: rgba(6, 182, 212, 0.12);

  /* Status Tokens */
  --status-live: #00F29E;
  --status-frozen: #38BDF8;
  --status-warning: #F59E0B;
  --status-danger: #EF4444;

  /* High-Contrast Typography */
  --text-bright: #F8FAFC;
  --text-muted: #94A3B8;
  --text-dim: #64748B;
  --text-inverse: #07090D;
}
```

---

## 5. Anti-Slop Code & Architecture Rules
1. **Zero Narrative Filler Comments**: Never output commentary like `// Filter 1`, `{/* Header container */}`, `// Step 2: Handle click`. Write self-documenting code with clear typed signatures.
2. **Function Length**: Keep all JSX helper functions and hooks under 50 lines.
3. **File Length**: Decompose views so that no single file exceeds 300 lines.
4. **TypeScript Strictness**: Zero `any`. All state, props, and callbacks must have strict type definitions.
5. **DOM Performance**: Large lists must use `@tanstack/react-virtual` with fixed row heights (`32px`).
