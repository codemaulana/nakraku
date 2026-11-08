---
name: unique-desktop-design-system
description: Architectural rules, unique colorways, bespoke typography, responsive viewport modes (Fullscreen / Standard / Compact / Mini Tray-overlay), and clean code refactoring standards for Nakraku Stash without AI slop, generic SaaS colors, or bloated card designs.
---

# Unique Desktop Design System (UDDS) — "Aurora Monolith"

## 1. Aesthetic Philosophy: "Tactical Aurora Monolith"
Nakraku Stash is an industrial-grade desktop session orchestration utility and RAM freeze command station. It completely rejects generic SaaS templates, bloated card padding, washed-out indigo gradients, and conversational placeholder text.

### Visual Invariants
1. **Zero Generic SaaS Colors**: Strictly no generic indigo (`#6366F1`) or washed purple gradients.
2. **Deep Titanium Canvas**: Deep pitch-black void (`#07090D`) with cold-slate surfaces (`#0D1117`), ambient glassmorphism (`backdrop-blur-md`), and brushed gunmetal elevations (`#131822`).
3. **Precision Phosphor & Cyan Accents**: Primary interactive signals use crisp **Terminal Phosphor Jade** (`#00F29E` / `#05FFA1`), telemetry highlights use **Electric Cyan** (`#00E5FF`), warnings use **Tungsten Amber** (`#F59E0B`), and destructive operations use **Laser Red** (`#EF4444`).
4. **Hairline Micro-Borders**: 1px laser borders (`#1B2230` or `rgba(255, 255, 255, 0.08)`) with razor-sharp micro-radii (2px–6px) and subtle outer glow highlights. Never puffy 16px–24px bloated web cards.
5. **High Information Density**: 32px–36px row heights, crisp monospace telemetry metrics, zero wasted vertical whitespace, and zero text collisions.

---

## 2. Real Native App Icon Pipeline & Smart Fallbacks

Every desktop window represents a real OS application. Relying on generic outline icons destroys user recognition.

### Invariants:
1. **Native Base64 Extraction**: Windows are enriched with `icon_base64` extracted directly via Win32 (`SHGetFileInfoW` / `WM_GETICON` / `GetDIBits`) returning top-down 32-bit BMP Data URLs (`data:image/bmp;base64,...`).
2. **Visual Presentation**:
   - Primary: Render `<img src={win.icon_base64} className="w-4 h-4 object-contain rounded-xs" />`.
   - Fallback: If no native icon is available, render a sleek tactical brand avatar: a 20x20px rounded square with the application's first two uppercase letters in `JetBrains Mono`, tinted with a deterministic phosphor or cyan hairline border.
3. **Process Exclusions**: Background utility overlays that render transparent full-screen windows (e.g. `NVIDIA Overlay.exe`, `nvcontainer.exe`, Discord hook helpers) are filtered out at the Win32 enumeration layer so they never clutter the user's workspace list.

---

## 3. Bespoke Typography System

### Font Pairings
- **Display & Headings**: `Space Grotesk` (`system-ui, -apple-system, "Segoe UI Variable Display"`) — authoritative, technical, sharp, and geometric.
- **Interface & Labels**: `Plus Jakarta Sans` (`Inter, "Segoe UI Variable Text", sans-serif`) with tight letter-spacing (`tracking-tight`).
- **Telemetry, PIDs & Coordinates**: `JetBrains Mono` (`font-feature-settings: 'tnum' 1, 'zero' 1`) for fixed-width numerical alignment.

### Hierarchy Scale
| Token | Size | Line Height | Tracking | Weight | Target Use |
|---|---|---|---|---|---|
| `--text-3xs` | 9px | 1.0 | +0.06em | 700 | Hex HWND badges, memory byte chips, status pills |
| `--text-2xs` | 10px | 1.1 | +0.04em | 600 | Monospace table column headers, PID tags |
| `--text-xs` | 11px | 1.2 | normal | 500 | Metadata, process names, coordinates |
| `--text-sm` | 12px | 1.3 | -0.01em | 400/500 | Table row items, window titles, list labels |
| `--text-md` | 13px | 1.4 | -0.01em | 500/600 | Section titles, input text, button labels |
| `--text-lg` | 15px | 1.3 | -0.02em | 600/700 | Primary view headers, modal headers |

---

## 4. Component Design Specifications

### 4.1. Memory HUD & Telemetry Meter
- Replaces plain flat progress bars with a futuristic multi-segment energy gauge.
- 16 to 24 glowing rectangular segments indicating memory saturation:
  - Green/Cyan phosphor below 60%
  - Tungsten amber between 60%–80%
  - Critical red above 80%
- Accompanied by numeric telemetry pills: `Used GB / Total GB`, `Load %`, and `Target: <35 MB Idle`.

### 4.2. Tactical Window Row (36px Density)
- Multi-column flex layout with explicit spacing to **strictly prevent text overlapping**:
  - `[Col 1: 24px]` Custom Phosphor Checkbox.
  - `[Col 2: 24px]` Native Base64 App Icon or Smart Avatar.
  - `[Col 3: Flex-1]` Window Title (bold, truncated, `text-sm`) + Subtitle (Process name, PID badge, HWND chip in `JetBrains Mono`).
  - `[Col 4: Auto]` State Badges (`ADMIN`, `MIN`, `FROZEN`) and Tabular RAM Metric (`xxx MB`).
- Row states: Smooth hover elevation (`bg-white/[0.03]`), active selection accent border on left (`2px solid #00F29E`).

### 4.3. Multi-Monitor Spatial Minimap & Topology
- Fullscreen mode presents a dual-pane layout with the `TacticalInspectorPanel`.
- Displays real monitor aspect ratios, resolution pills (`1920x1080 (0,0)`), and window coordinate clamping bounds with sleek glowing borders.

### 4.4. Viewport Segmented Controls & Window Actions
- Embedded in custom 38px frameless titlebar.
- Compact segmented control (`[Compact] [Standard] [Full]`) with smooth active pill background.
- Native Win32 frameless buttons (Minimize, Maximize, Close) with hover transitions.

---

## 5. Anti-Slop Code & Architecture Rules
1. **Zero Narrative Filler Comments**: Never output commentary like `// Filter 1`, `{/* Header container */}`, `// Step 2: Handle click`. Write self-documenting code with clear typed signatures.
2. **Function Length**: Keep all JSX helper functions and hooks under 50 lines.
3. **File Length**: Decompose views so that no single file exceeds 300 lines.
4. **TypeScript Strictness**: Zero `any`. All state, props, and callbacks must have strict type definitions.
5. **No Visual Overlap Invariant**: Every text element must have defined bounding constraints (`truncate`, `min-w-0`, `flex-shrink`). Absolute coordinates must never overlap text labels.
