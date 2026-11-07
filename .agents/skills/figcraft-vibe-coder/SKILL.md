---
name: figcraft-vibe-coder
description: Interactive UI/UX design, visual prototyping, and code-connect workflow using the FigCraft MCP server and CLI for NakrakuUI.figcraft.
---

# FigCraft UI/UX Vibe Coder Skill

## 1. Overview
FigCraft is an open-source, native Rust vector design tool with built-in MCP (Model Context Protocol) support. This skill enables the AI agent to interact directly with `NakrakuUI.figcraft` to design, iterate, prototype ("vibe code"), and export UI components in parity with React code.

## 2. Tooling & Connection Setup

### 2.1 Executables
- Desktop Application: `C:\Program Files\FigCraft\figcraft.exe`
- CLI & MCP Engine: `C:\Program Files\FigCraft\figcraft-cli.exe`
- Target Document: `c:\Nakraku\NakrakuUI.figcraft`

### 2.2 Connection Modes
1. **Live Interactive Mode via Antigravity MCP (Primary & Active)**:
   - Antigravity exposes the lazy MCP server `figcraft` directly connected to the active FigCraft window in the IDE.
   - All design mutations (`create_node`, `set_properties`, `run_command`, `batch`) execute live in the active window canvas instantly.
   - Call `save_file` to commit changes to `c:/Nakraku/NakrakuUI.figcraft`.
2. **Headless CLI / Automation Mode (Secondary)**:
   - CLI executable: `C:\Program Files\FigCraft\figcraft-cli.exe`
   - Commands: `info`, `render`, `export`, `run`, `connect`.
   - Used for headless validation, automated PNG snapshots (`scripts/figcraft-preview.ps1`), and CI/CD checks.

### 2.3 Antigravity MCP Tools Reference (`ServerName: "figcraft"`)
- `inspect_document`: Read the active document tree, selection, styles, and variables.
- `open_file`: Open or reload `c:/Nakraku/NakrakuUI.figcraft` as the active front tab.
- `create_node`: Create a frame, rectangle, text, vector, or component live on canvas.
- `set_properties`: Update layout, fills, strokes, padding, gap, typography, etc.
- `run_command`: Execute any FigCraft engine command (e.g. `page.setBackground`, `align.left`, `variable.create`).
- `batch`: Execute multiple commands atomically in one undo step.
- `save_file`: Persist the active document to disk.
- `screenshot`: Capture visual PNG data of layers or window.

## 3. Vibe Coding & Design Loop

```
+------------------------------------+
| 1. Plan Frame / Component Layout   |
+-----------------+------------------+
                  |
                  v
+------------------------------------+
| 2. Execute FigCraft Commands       | (node.create, frame.create, text.create)
+-----------------+------------------+
                  |
                  v
+------------------------------------+
| 3. Render PNG Visual Snapshot      | (figcraft-cli render --out preview.png)
+-----------------+------------------+
                  |
                  v
+------------------------------------+
| 4. Inspect Visual Alignment        | (Density check: 32px rows, 38px titlebar)
+-----------------+------------------+
                  |
                  v
+------------------------------------+
| 5. Code-Connect to React Component | (Mirror component hierarchy in src/)
+------------------------------------+
```

## 4. Key FigCraft Commands Reference
- `frame.create`: Creates artboard/container frame (e.g., Main Window 900x600, Sidebar 200px).
- `node.create`: Creates base shape (rectangle, line, vector) with fill and stroke.
- `text.create`: Places typography with specified font family, weight, and size.
- `node.set`: Modifies layout props, auto-layout gap, alignment, padding, and corner radius.
- `figcraft-cli run --in <file> --out <file> <script.json>`: Batches design changes atomically.
- `figcraft-cli render --out <file.png> <file>`: Generates high-res visual preview of the canvas.

## 5. Design Token Synchronization
Maintain exact alignment between `src/styles/tokens.css` and FigCraft styles:
- Background Base: `#080A0E`
- Surface Base: `#0F1319`
- Elevated Surface: `#161B22`
- Border Subtle: `#1F2633`
- Emerald Accent: `#10B981`
- Text Primary: `#F3F4F6`
- Text Secondary: `#9CA3AF`
- Typography: `Inter` for UI, `JetBrains Mono` for telemetry.

## 6. Brainstorming Spatial UX Layouts
Before creating complex frames in `NakrakuUI.figcraft` (e.g., Task 1.5 Live Table, Task 1.6 Spatial Minimap, Task 1.8 Command Palette):
1. Execute `deep-recursive-brainstormer` to evaluate visual density, information hierarchy, and layout auto-layout constraints.
2. Ensure strict adherence to high-density desktop utility standards (32px rows, 38px titlebar) before committing frames.
