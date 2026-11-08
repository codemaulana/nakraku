# Nakraku Stash — Living Context & Architectural Decision Records

> **Document Version**: 1.0.0  
> **Target Platform**: Windows 11 / Windows 10 (x64)  
> **Master Roadmap**: 288 tasks across 21 phases (`nakraku_full_task_breakdown.md`)

---

## 1. System Identity & North Star Metrics
Nakraku Stash is an open-source, high-density desktop session manager and RAM-freeze utility for power users and developers. It provides 1-click snapshotting, minimization, and atomic restoration of desktop windows, coordinates, and browser tabs.

| Metric | Target Constraint | Current Status |
|---|---|---|
| Idle RAM Footprint | `< 35 MB` | **34.54 MB** (Verified in Task 0.6) |
| Cold Launch to Interactive | `< 400 ms` | Pending Phase 12 Benchmark |
| Stash Latency (20 Windows) | `< 300 ms` | Pending Phase 5 Implementation |
| Restore Latency (20 Windows)| `< 1000 ms`| Pending Phase 5 Implementation |
| Type Safety | Zero `any` | **Enforced via Oxlint & Guardrails** |
| Panic Safety | Zero OS `unwrap()` | **Enforced via Guardrails v1** |

---

## 2. Architectural Decision Records (ADRs)

### ADR-001: Tauri v2 + Rust Backend over Electron
* **Context**: Desktop session management requires low-level Win32 FFI (`EnumWindows`, `SetWindowPos`, `ShowWindow`) and minimal resource usage. Electron consumes 150MB–300MB idle RAM, defeating the purpose of a RAM-freezing utility.
* **Decision**: Adopt Tauri v2 with Rust 1.99 (`x86_64-pc-windows-msvc`).
* **Consequence**: Native memory footprint reduced to ~34.5MB; native access to Windows APIs via `windows-sys` crate with zero webview abstraction overhead.

### ADR-002: React 18/19 + TypeScript Strict + Vite Frontend
* **Context**: The GUI requires high-frequency telemetry updates (RAM meters, process lists) without GC pauses or layout thrashing.
* **Decision**: Pair Vite with strict TypeScript, Oxlint, and Tailwind CSS.
* **Consequence**: Sub-second dev builds (621ms), strict compile-time type validation, zero runtime overhead.

### ADR-003: FigCraft Native Vector Canvas for UI/UX Vibe Coding
* **Context**: UI must be designed with 1:1 visual parity to production React components without relying on proprietary cloud lock-in.
* **Decision**: Use FigCraft (`NakrakuUI.figcraft`) via its local MCP server and CLI (`figcraft-cli.exe`).
* **Consequence**: Local, offline, Rust-native design editing; direct Code Connect mapping from FigCraft frames to React JSX.

### ADR-004: Local WebSocket Bridge (`ws://127.0.0.1:48123`) for Browser Tabs
* **Context**: Modern Chromium browsers sandbox tabs. Native desktop apps cannot inspect tab URLs or restore sessions without an extension.
* **Decision**: Deploy a lightweight MV3 companion extension that connects over local WebSocket loopback to Tauri's background Tokio service.
* **Consequence**: Real-time two-way synchronization of open tabs without cloud telemetry or external network calls.

### ADR-005: Offline Ed25519 Cryptographic Licensing
* **Context**: Monetization (Free tier: 3 workspaces vs Pro: unlimited) must function completely offline without phoning home to license servers.
* **Decision**: Validate asymmetric Ed25519 signatures embedded in license keys against a public key bundled into the binary, hashed against hardware machine ID (BIOS + Disk serial).
* **Consequence**: Zero telemetry, instantaneous offline activation, tamper-evident.

### ADR-006: SQLite (`tauri-plugin-sql`) with WAL Journal Mode
* **Context**: Stored sessions, workspace coordinates, and window hierarchies must survive unexpected system reboots and blue screens.
* **Decision**: Use embedded SQLite configured with `PRAGMA journal_mode = WAL` and `PRAGMA synchronous = NORMAL`.
* **Consequence**: ACID compliance, instant concurrent writes, zero file corruption on crash.

### ADR-007: Anti-Slop Code & UI Invariant
* **Context**: AI-generated code frequently suffers from conversational narrative commentary, loose `any` typing, unhandled panics, and bloated SaaS card padding.
* **Decision**: Enforce automated pre-commit scanning (`scripts/guardrails.ps1`, `oxlint.json`, `lefthook.yml`) blocking narrative comments, `any`, and `unwrap()` in non-test code.
* **Consequence**: Production-grade, self-documenting code with compact 32px–36px desktop utility density.

---

## 3. Toolchain & Environment Audit Snapshot
Audit executed via `scripts/check-env.ps1`:
* **Node.js**: `v22.17.1` (OK)
* **npm**: `11.13.0` (OK)
* **Rust (`rustc`)**: `rustc 1.99.1` (OK)
* **Cargo**: `cargo 1.99.1` (OK)
* **Tauri CLI**: `tauri-cli 2.12.4` (OK)
* **FigCraft CLI**: `figcraft-cli 0.16.0` (OK)
* **WebView2**: `157.0.4341.42` via Edge Fallback (OK)
* **MSVC Build Tools**: Not detected (Target: Visual Studio C++ Build Tools for native linking)

---

## 4. Master 21-Phase Status & Roadmap Progress

| Phase | Description | Task Count | Status |
|---|---|---|---|
| **Phase 0** | Foundations & Toolchain | 15 | **COMPLETED (15/15) [Tag: v0.0.1-scaffold]** |
| **Phase 1** | FigCraft UI/UX Design & Vibe Coding (MCP) | 10 | **ACTIVE (In Progress)** |
| **Phase 2** | React Design System & Component Library | 28 | Queued |
| **Phase 3** | Application Shell & Navigation | 18 | Queued |
| **Phase 4** | Data Layer & Local Database | 17 | Queued |
| **Phase 5** | Win32 OS Engine (Rust) | 21 | Queued |
| **Phase 6** | Core Business Logic | 14 | Queued |
| **Phase 7** | Frontend — Dashboard & Live View | 12 | Queued |
| **Phase 8** | Frontend — Workspaces View | 13 | Queued |
| **Phase 9** | Frontend — Settings View | 9 | Queued |
| **Phase 10**| Browser Extension (MV3) | 16 | Queued |
| **Phase 11**| Licensing & Monetization | 15 | Queued |
| **Phase 12**| Error Handling & Telemetry | 10 | Queued |
| **Phase 13**| Performance & Optimization | 10 | Queued |
| **Phase 14**| Testing Suite | 20 | Queued |
| **Phase 15**| Security Audit | 10 | Queued |
| **Phase 16**| Installer & Distribution | 12 | Queued |
| **Phase 17**| CI/CD Pipeline | 8 | Queued |
| **Phase 18**| Documentation | 14 | Queued |
| **Phase 19**| Open Source Hygiene | 9 | Queued |
| **Phase 20**| Landing Page | 7 | Queued |
| **TOTAL** | | **288** | |

---

## 5. Phase 0 Task Log
- `[0.1]` Minimal Project Scaffold (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`, `AGENTS.md`) — **DONE**
- `[0.2]` Toolchain & Environment Audit Script (`scripts/check-env.ps1`) — **DONE**
- `[0.3]` Install Rust toolchain via rustup (`rustc 1.99.1`, `cargo 1.99.1`) — **DONE**
- `[0.4]` Install Tauri CLI v2 (`cargo-tauri 2.12.4`, `tauri 2.12.4`) — **DONE**
- `[0.5]` Scaffold Tauri v2 into project (`src-tauri/`, `Cargo.toml`, `build.rs`, `src/lib.rs`, `src/main.rs` — verified with `cargo check`) — **DONE**
- `[0.6]` Verify Tauri dev mode boots (`cargo build`, `npm run build`, process boot verified responding: True, idle RAM ~34.5MB) — **DONE**
- `[0.7]` Configure `tauri.conf.json` window basics (width: 900, height: 600, minWidth: 720, minHeight: 480, decorations: false, transparent: true, center: true) — **DONE**
- `[0.8]` Configure `tauri.conf.json` security (strict CSP header: no unsafe-eval, WebSocket bridge `ws://127.0.0.1:48123` allowed, minimal `core:default`) — **DONE**
- `[0.9]` Configure `tauri.conf.json` build targets (targets: ["nsis", "msi"], productName: "Nakraku Stash", identifier: "com.nakraku.stash", nsis installMode: "currentUser") — **DONE**
- `[0.10]` Add `.editorconfig` + `oxlint` config with anti-slop rules (`.editorconfig`, `oxlint.json`, `npm run lint` verified) — **DONE**
- `[0.11]` Add `lefthook.yml` pre-commit hooks (runs `oxlint`, `tsc --noEmit`, `cargo check` before commits — verified with `npx lefthook run pre-commit`) — **DONE**
- `[0.12]` Write `scripts/guardrails.ps1` v1 (checks anti-slop patterns, `any`, `unwrap()`, `expect()`, excessive padding, integrated into lefthook) — **DONE**
- `[0.13]` Formalize living documentation (`docs/CONTEXT.md` v1 with ADRs and complete task table) — **DONE**
- `[0.14]` Write `docs/BUGS.md` v1 (formalize bug tracker schema, severity classification, and initial triage log) — **DONE**
- `[0.15]` Finalize Git repo baseline & commit Task 0 deliverables (`commit: 15cd469`, tag `v0.0.1-scaffold`) — **DONE**

---

## 6. Phase 1 Task Log (FigCraft UI/UX Design & Vibe Coding)
- `[1.1]` FigCraft MCP & CLI bridge setup (verify live Antigravity MCP connection and `figcraft-cli` info on `NakrakuUI.figcraft`, page background initialized to `#080A0E`) — **DONE**
- `[1.2]` Design Tokens in FigCraft (populated 28 variables: 16 Obsidian colors, 12 spacing/metrics, and 24 styles: 8 typography, 16 paints in `NakrakuUI.figcraft`) — **DONE**
- `[1.3]` Canvas Artboard & 38px Titlebar (created 900x600 Desktop Window frame, 38px frameless titlebar with window controls, verified PNG render) — **DONE**
- `[1.4]` Sidebar Navigation Frame (designed 200px collapsible sidebar with 32px nav rows, badges, RAM freeze telemetry, verified PNG render) — **DONE**
- `[1.5]` Dashboard & Live Window Table (designed 32px row window list, PID/RAM monospace metrics, RAM meter bar, 28px Stash CTA, verified PNG render) — **DONE**
- `[1.6]` Spatial Monitor Minimap (designed multi-display layout visualizer with 2 monitors, live window boxes, HWND coordinate inspector, verified 1850x600 PNG render) — **DONE**
- `[1.7]` Workspace Cards & Quick Switcher (designed 900x600 Workspaces view frame at x:2000, 3 x 42px workspace rows, drag handles, color tags, Free Tier 3/3 banner, verified 2800x600 PNG render) — **DONE**
- `[1.8]` Command Palette (Ctrl+K) Overlay (designed 900x600 dim overlay frame at x:100,y:750 with 560px modal, search input, active windows fuzzy list, workspaces, and system action accelerators, verified 2800x1250 PNG render) — **DONE**
- `[1.9]` Settings & Danger Zone Frames (designed 900x600 Settings frame at x:1050,y:750 with 200px sidebar, General startup toggles, MV3 WebSocket loopback card, Ed25519 license activation with hardware machine ID, auto-snapshot interval and global hotkey, and isolated Danger Zone card with red #EF4444 destructive actions) — **DONE**
- `[1.10]` Render PNG Visual Review & Code-Connect — **SKIPPED** (Bypassed per user directive to build directly in React design system)

---

## 7. Phase 2 Task Log (React Design System & Component Library)
- `[2.1]` Define design tokens — color palette (`src/styles/tokens.css`: `--bg-base`, `--bg-surface`, `--bg-elevated`, `--bg-hover`, `--border-subtle`, `--accent-emerald`, text hierarchy, status indicators, imported in `src/main.tsx`) — **DONE**
- `[2.2]` Define design tokens — typography (`src/styles/tokens.css`: `--font-mono`, `--font-ui`, `--text-2xs` through `--text-lg`, line heights `--leading-none` to `--leading-normal`, tracking, font weights, and body/code element defaults) — **DONE**
- `[2.3]` Define design tokens — spacing & density (`src/styles/tokens.css`: `--titlebar-height: 38px`, `--statusbar-height: 24px`, `--sidebar-width: 200px`, `--row-height: 32px`, `--row-height-lg: 36px`, micro-gaps `--gap-3xs` to `--gap-lg`, and padding scale `--pad-3xs` to `--pad-lg`) — **DONE**
- `[2.4]` Define design tokens — border & radius (`src/styles/tokens.css`: `--border-width`, `--border-width-thick`, semantic border colors `--border-color-subtle` through `--border-color-warning`, and radius scale `--radius-none` to `--radius-full`) — **DONE**
- `[2.5]` Configure Tailwind CSS (`tailwind.config.ts` consuming `tokens.css` with strict colors isolation, PostCSS configured, purge paths set, verified in `src/App.tsx`) — **DONE**
- `[2.6]` Build `Titlebar` component (`src/components/Titlebar.tsx`: Frameless 38px bar with status dot, title, badge, drag region `data-tauri-drag-region`, and pixel-perfect minimize/maximize/close buttons, integrated into `src/App.tsx`) — **DONE**
- `[2.7]` Build `Titlebar` — window control logic (`src/hooks/useWindowControls.ts`: Wired Tauri v2 `appWindow.minimize()`, `appWindow.toggleMaximize()`, `appWindow.close()`, and `appWindow.onResized()` maximize state listener, with capabilities configured in `src-tauri/capabilities/default.json` and safe browser fallbacks) — **DONE**
- `[2.8]` Build `Titlebar` — vibrancy / blur effect (`src/components/Titlebar.tsx`: Added `vibrant` glass mode via `bg-bg-surface-glass` and `backdrop-blur-vibrant` with tokens `--bg-surface-glass` and `--backdrop-blur: 16px`) — **DONE**
- `[2.9]` Build `Sidebar` layout shell (Left sidebar 200px: nav icons + labels, collapse toggle, keyboard shortcut hint) — **NEXT**
