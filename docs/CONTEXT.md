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
| **Phase 1** | FigCraft UI/UX Design & Vibe Coding (MCP) | 10 | **COMPLETED (10/10)** |
| **Phase 2** | React Design System & Component Library | 28 | **COMPLETED (28/28)** |
| **Phase 3** | Application Shell & Navigation | 18 | **COMPLETED (18/18)** |
| **Phase 4** | Data Layer & Local Database | 17 | **COMPLETED (17/17)** |
| **Phase 5** | Win32 OS Engine (Rust) | 21 | **COMPLETED (21/21)** |
| **Phase 6** | Core Business Logic | 14 | **COMPLETED (14/14)** |
| **Phase 7** | Frontend — Dashboard & Live View | 12 | **COMPLETED (12/12)** |
| **Phase 8** | Frontend — Workspaces View | 13 | **COMPLETED (13/13)** |
| **Phase 9** | Frontend — Settings View | 9 | **ACTIVE (In Progress)** |
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
- `[2.9]` Build `Sidebar` layout shell (`src/components/Sidebar.tsx`: 200px collapsible sidebar with 32px nav rows, badges, Ctrl+B keyboard shortcut listener, icon-only 48px collapse mode, integrated into `src/App.tsx`) — **DONE**
- `[2.10]` Build `MainPanel` layout shell (`src/components/MainPanel.tsx`: Right content area with flex-1 grow, fixed optional header/footer slots, overflow-y auto with thin `.custom-scrollbar`, integrated into `src/App.tsx`) — **DONE**
- `[2.11]` Build `StatusBar` component (`src/components/StatusBar.tsx`: 24px bottom bar with WebSocket bridge indicator `WS:48123`, process and window counts, monospace RAM usage and saved metrics, live 24h clock, integrated into `src/App.tsx`) — **DONE**
- `[2.12]` Build `Row` base component (`src/components/Row.tsx`: 32px standard desktop row with `h-row`/`h-row-sm`/`h-row-lg` sizing, selected border accent, hover state, text truncation, slots for icon, label, description, meta, and actions, keyboard Enter/Space accessibility, integrated into `src/App.tsx`) — **DONE**
- `[2.13]` Build `Badge` component (`src/components/Badge.tsx`: Compact pill and micro-tag badge supporting `active`, `frozen`, `warning`, `danger`, `accent`, `count`, and `neutral` states, dot indicator, pulsing animation, and monospace metrics font; updated `tokens.css` with status muted tokens, integrated into `Sidebar.tsx`, `Row.tsx`, and `src/App.tsx`) — **DONE**
- `[2.14]` Build `Icon` system (`src/components/Icon.tsx`: Unified thin-line SVG icon set mapped to curated `IconName` registry with consistent `1.5` stroke width, standard size scales `xs`(12px), `sm`(14px), `md`(16px), `lg`(20px), accessible `role="img"` support, integrated into `Row.tsx` and `App.tsx`) — **DONE**
- `[2.15]` Build `Tooltip` component (`src/components/Tooltip.tsx`: 200ms delay, 12px font `--text-sm`, dark surface `bg-bg-elevated`, no arrow, keyboard accessible with Escape and focus handling, shortcut keycaps hint support, positionable top/bottom/left/right, integrated into `src/App.tsx`) — **DONE**
- `[2.16]` Build `ContextMenu` component (`src/components/ContextMenu.tsx`, `src/hooks/useContextMenu.ts`: Floating right-click context menu with viewport edge boundary clamping, full keyboard navigation (ArrowUp/Down, Enter, Esc), nested sub-menu cascade support, danger action styles, separator lines, integrated into `Row.tsx` and `src/App.tsx`) — **DONE**
- `[2.17]` Build `Modal` component (`src/components/Modal.tsx`, `src/hooks/useFocusTrap.ts`: Dimmed backdrop overlay, centered dialog card, size scale `sm`/`md`/`lg`/`xl`, robust keyboard focus trap looping Tab/Shift+Tab, Escape dismiss, auto-focus & restore on close, `aria-modal`, `aria-labelledby`, `aria-describedby`, integrated into `src/App.tsx`) — **DONE**
- `[2.18]` Build `Button` component variants (`src/components/Button.tsx`: High-density 32px height buttons with `primary`, `secondary`, `ghost`, and `danger` variants, equal-aspect `icon-only` square mode, loading spinner state, keyboard accessibility, integrated into `src/App.tsx`) — **DONE**
- `[2.19]` Build `Input` component (`src/components/Input.tsx`: High-density 32px standard `h-8` and 28px `h-7` input, monospace system font, emerald focus ring `focus-within:ring-accent-emerald`, danger error state, label above, helper text/error footer, left/right icon slots, clear button, and shortcut badge; extracted `StashModal.tsx`, integrated search filter into `src/App.tsx`) — **DONE**
- `[2.20]` Build `Kbd` component (`src/components/Kbd.tsx`: Keyboard shortcut display supporting sizes `xs`/`sm`/`md`, variants `default`/`elevated`/`outline`/`ghost`, multi-key splitting `splitKeys`, and accessible screen reader ARIA labels; integrated into `Tooltip.tsx`, `Input.tsx`, `Sidebar.tsx`, `Button.tsx`, `ContextMenu.tsx`, and `App.tsx`) — **DONE**
- `[2.21]` Build `Spinner` / `SkeletonRow` loading states (`src/components/Spinner.tsx`: SVG circular animated spinner with sizes `xs`/`sm`/`md`/`lg` and variants `accent`/`secondary`/`current`/`white`; `src/components/SkeletonRow.tsx`: base `Skeleton`, 32px standard `SkeletonRow`, and multi-row `SkeletonList` with staggered realistic widths; wired into `Button.tsx` and async loading scan in `src/App.tsx`) — **DONE**
- `[2.22]` Build `EmptyState` component (`src/components/EmptyState.tsx`: High-density empty state with preset configs `windows`, `workspaces`, `search`, `history`, `tabs`, compact mode, action CTA slot, and shortcut keycaps; integrated into process filter search in `src/App.tsx`) — **DONE**
- `[2.23]` Build `Divider` component (`src/components/Divider.tsx`: 1px horizontal and vertical separator respecting `--border-subtle`, variants `subtle`/`muted`/`accent`/`danger`, spacing scales, and horizontal labeled dividers; integrated into `ContextMenu.tsx` and `App.tsx`) — **DONE**
- `[2.24]` Build `ScrollArea` component (`src/components/ScrollArea.tsx`: Custom thin 4px/6px scrollbar, idle auto-hiding with `useScrollIdle`, vertical/horizontal/bidirectional modes; updated `tokens.css` with `.scrollarea-thin` and `.scrollarea-autohide`, integrated into `MainPanel.tsx`, `Sidebar.tsx`, `Modal.tsx`, and `App.tsx`) — **DONE**
- `[2.25]` Write Storybook / component gallery (dev-only) (`src/dev/Gallery.tsx`: visual QA gallery workbench with modular sections `AtomicsSection.tsx`, `InputsSection.tsx`, and `LayoutsSection.tsx`, interactive tab switcher, `DEFAULT_NAV_ITEMS` dev link in `Sidebar.tsx`, and isolated `ProcessList.tsx` extraction) — **DONE**
- `[2.26]` Accessibility audit — components (`scripts/a11y-audit.mjs`: automated WCAG 2.1 AA luminance & contrast tester auditing 32 token pairings with 100% pass rate; adjusted `--danger` to `#F87171` (6.47:1), `--text-disabled` to `#7E8B9B` (5.82:1), and `--status-frozen` to `#60A5FA` (7.94:1); audited and added visible emerald focus rings across `Sidebar`, `Titlebar`, `Modal`, `Input`, and `Button`) — **DONE**
- `[2.27]` Keyboard navigation audit — components (`scripts/keyboard-audit.mjs`, `src/hooks/useAppShortcuts.ts`, `src/App.tsx`, `src/components/Input.tsx`, `src/dev/Gallery.tsx`: global shortcut listener for Ctrl+F search focus, Ctrl+S stash modal, Alt+1..4 tab switching, Escape dismiss on Gallery and Input clear, Tab/Shift+Tab focus trap in modals, verified 27/27 keyboard invariants) — **DONE**
- `[2.28]` Snapshot tests — design tokens (`tests/tokens.test.ts`, `tests/__snapshots__/tokens.test.ts.snap`: 6 Vitest tests asserting 58 design tokens, obsidian palette, 38px/24px/32px metrics, JetBrains Mono font, and sharp radii snapshot baseline) — **DONE**

---

## 8. Phase 3 Task Log (Application Shell & Navigation)
- `[3.1]` Define app routes / view enum (`src/lib/routes.ts`: `Dashboard`, `Workspaces`, `ActiveSession`, `Settings`, `About`, `Minimap`, `Gallery`) — **DONE**
- `[3.2]` Build client-side router (`src/router/Router.tsx`: hash-based, route history stack, zero bloated dependencies) — **DONE**
- `[3.3]` Build `Dashboard` view skeleton (`src/views/DashboardView.tsx`: Process table, action toolbar, filter input) — **DONE**
- `[3.4]` Build `Workspaces` view skeleton (`src/views/WorkspacesView.tsx`: Workspace list, Free Tier 3/3 banner, color tags, RAM metrics) — **DONE**
- `[3.5]` Build `ActiveSession` view skeleton (`src/views/ActiveSessionView.tsx`: Live process telemetry, window HWND tree, memory gauge) — **DONE**
- `[3.6]` Build `Settings` view skeleton (`src/views/SettingsView.tsx`: General autostart, tray settings, extension bridge, hotkeys, licensing, danger zone) — **DONE**
- `[3.7]` Build `About` view skeleton (`src/views/AboutView.tsx`: App version, build hash, MIT license, diagnostics grid) — **DONE**
- `[3.8]` Build sidebar navigation with active state (`src/components/Sidebar.tsx`: wired to active route with keyboard accelerators) — **DONE**
- `[3.9]` Persist last-open route across restarts (`src/router/Router.tsx`: localStorage `nakraku_last_route` synchronization) — **DONE**
- `[3.10]` Build `CommandPalette` (Ctrl+K) (`src/components/CommandPalette.tsx`: 560px modal dialog, fuzzy search, arrow navigation) — **DONE**
- `[3.11]` Global keyboard shortcut map (`src/lib/shortcuts.ts`: unified registry, fuzzy search algorithm) — **DONE**
- `[3.12]` Register Tauri global shortcuts (`src-tauri/src/shortcuts.rs`: `tauri-plugin-global-shortcut` for `Ctrl+Shift+N` and `Ctrl+Shift+R`) — **DONE**
- `[3.13]` System tray integration (`src-tauri/src/tray.rs`: Tray icon, tooltip, right-click menu with Show, Stash All, Quit) — **DONE**
- `[3.14]` System tray — minimize to tray on close (`src-tauri/src/lib.rs`: `CloseRequested` interception, `api.prevent_close()`, hide window) — **DONE**
- `[3.15]` System tray — dynamic badge (`src-tauri/src/tray.rs`: `update_tray_status` command for workspaces and RAM saved) — **DONE**
- `[3.16]` Auto-launch on Windows startup (`src-tauri/src/lib.rs`: `tauri-plugin-autostart` with `--minimized` flag) — **DONE**
- `[3.17]` Window state persistence (`src-tauri/src/window_state.rs`: saves/restores outer position and size in AppData JSON) — **DONE**
- `[3.18]` Multi-monitor support (`src-tauri/src/window_state.rs`: `clamp_to_monitors` checking available monitors on restore) — **DONE**

---

## 9. Phase 4 Task Log (Data Layer & Local Database)
- `[4.1]` Design SQLite database schema v1 & ERD diagram (`docs/schema.md`: `workspaces`, `sessions`, `windows`, `tabs`, `app_settings` with relations & indexes) — **DONE**
- `[4.2]` Write initial SQL migration schema (`migrations/001_init.sql`, `src-tauri/migrations/001_init.sql`: Foreign keys, cascades, indexes, timestamps) — **DONE**
- `[4.3]` Configure SQLite database initialization with WAL journal mode (`src-tauri/src/db/mod.rs`: `journal_mode=WAL`, `foreign_keys=ON`, `synchronous=NORMAL`, automated migration runner) — **DONE**
- `[4.4]` Build thread-safe connection pool/wrapper (`src-tauri/src/db/mod.rs`: `DbPool` using `Arc<Mutex<Connection>>` with transaction helpers) — **DONE**
- `[4.5]` Write Rust repository `workspace_repo.rs` (`create`, `list`, `get`, `rename`, `delete`, `reorder` — typed errors, zero unwrap) — **DONE**
- `[4.6]` Write Rust repository `session_repo.rs` (`save_session`, `list_sessions`, `get_session`, `delete_session`) — **DONE**
- `[4.7]` Write Rust repository `window_repo.rs` (`upsert_windows`, `list_by_session`, `delete_by_session`) — **DONE**
- `[4.8]` Write Rust repository `tab_repo.rs` (`upsert_tabs`, `list_by_window`, `delete_by_session`) — **DONE**
- `[4.9]` Expose Tauri commands for workspace CRUD (`src-tauri/src/db/commands.rs`: `create_workspace`, `list_workspaces`, `get_workspace`, `rename_workspace`, `delete_workspace`, `reorder_workspaces`) — **DONE**
- `[4.10]` Expose Tauri commands for session, window, and tab CRUD (`src-tauri/src/db/commands.rs`: `save_session`, `list_sessions`, `get_session`, `delete_session`, `upsert_windows`, `list_windows_by_session`, `upsert_tabs`, `list_tabs_by_window`) — **DONE**
- `[4.11]` Write TypeScript API client (`src/lib/api.ts`: typed wrappers around `invoke()` with `isTauri` detection, typed error mapping, and Zod output validation) — **DONE**
- `[4.12]` Write Zod validation schemas (`src/lib/schemas.ts`: strict runtime validation for workspaces, sessions, windows, tabs, and settings) — **DONE**
- `[4.13]` Unit tests for Rust repositories (`src-tauri/src/db/`: in-memory SQLite CRUD tests with zero unwrap, returning Result) — **DONE**
- `[4.14]` Unit tests for TypeScript API client (`tests/api.test.ts`: Vitest suite covering Zod validation, IPC calls, fallbacks, and error paths) — **DONE**
- `[4.15]` Write settings migration (`migrations/002_settings.sql`, `src-tauri/migrations/002_settings.sql`: `app_settings` key-value table) — **DONE**
- `[4.16]` Write settings repository & Tauri commands (`src-tauri/src/db/settings_repo.rs`: `get_app_setting`, `set_app_setting`) — **DONE**
- `[4.17]` Database backup utility (`src-tauri/src/db/backup.rs`: `backup_db()` creating timestamped `.bak` files) — **DONE**

---

## 10. Phase 5 Task Log (Win32 OS Engine)
- `[5.1]` Research Win32 API surface needed (`docs/win32-api-surface.md`: comprehensive mapping of `EnumWindows`, `DwmGetWindowAttribute`, `GetWindowPlacement`, `SetWindowPos`, `OpenProcess`, `QueryFullProcessImageNameW`, `K32GetProcessMemoryInfo`, `GlobalMemoryStatusEx`, and `SetWinEventHook`) — **DONE**
- `[5.2]` Add `windows-sys` crate with required features (`src-tauri/Cargo.toml`: features `Win32_Foundation`, `Win32_UI_WindowsAndMessaging`, `Win32_UI_Accessibility`, `Win32_Graphics_Dwm`, `Win32_System_Threading`, `Win32_System_ProcessStatus`, `Win32_System_SystemInformation`) — **DONE**
- `[5.3]` Write window enumeration module (`src-tauri/src/os/window_enum.rs`: `enumerate_windows()`, `get_window_title()`, `get_window_class_name()`, `get_window_rect()`, `get_window_state()`) — **DONE**
- `[5.4]` Write `RawWindow` struct & OS types (`src-tauri/src/os/types.rs`: `RawWindow`, `WindowRect`, `ProcessInfo`, `MemoryStats`, `SessionSnapshot`) — **DONE**
- `[5.5]` Filter system/invisible windows (`src-tauri/src/os/filter.rs`: filters cloaked windows via `DWMWA_CLOAKED`, desktop shell classes, UWP system hosts, zero-sized windows, and self PID) — **DONE**
- `[5.6]` Process info & memory telemetry (`src-tauri/src/os/process_info.rs`: `get_process_info()`, `query_process_path()`, `query_memory_bytes()`, and `get_system_memory_stats()`) — **DONE**
- `[5.7]` Window snapshot module (`src-tauri/src/os/window_snapshot.rs`: `snapshot_session()` computing total RAM saved and attaching timestamps) — **DONE**
- `[5.8]` Window restore engine (`src-tauri/src/os/window_restore.rs`: `restore_session_windows()` positioning HWNDs via `SetWindowPos` and relaunching closed processes) — **DONE**
- `[5.9]` Window minimize logic (`src-tauri/src/os/window_restore.rs`: `minimize_all_windows()` batch minimizing active windows) — **DONE**
- `[5.10]` Window restore from minimize (`src-tauri/src/os/window_restore.rs`: `restore_window()` via `SW_RESTORE` and `SW_SHOWMAXIMIZED`) — **DONE**
- `[5.11]` Process launch logic (`src-tauri/src/os/process_launch.rs`: `launch_process()` using `std::process::Command` with existence and error checks) — **DONE**
- `[5.12]` UAC / elevation handling (`src-tauri/src/os/process_info.rs`, `process_launch.rs`: falls back to `PROCESS_QUERY_LIMITED_INFORMATION`, flags `is_elevated`, surfaces `OsError::ElevationRequired`) — **DONE**
- `[5.13]` Expose Tauri command `cmd_snapshot_session` (`src-tauri/src/os/commands.rs`) — **DONE**
- `[5.14]` Expose Tauri command `cmd_restore_session` (`src-tauri/src/os/commands.rs`: bridges SQLite windows and restores positions) — **DONE**
- `[5.15]` Expose Tauri command `cmd_minimize_all` (`src-tauri/src/os/commands.rs`) — **DONE**
- `[5.16]` Expose Tauri command `cmd_get_live_windows` (`src-tauri/src/os/commands.rs`) — **DONE**
- `[5.17]` Expose Tauri command `cmd_get_memory_stats` (`src-tauri/src/os/commands.rs`) — **DONE**
- `[5.18]` OS event listener for active window change (`src-tauri/src/os/events.rs`: `SetWinEventHook` listening to `EVENT_SYSTEM_FOREGROUND`, emits `"os:foreground-changed"`) — **DONE**
- `[5.19]` OS event listener for window lifecycle (`src-tauri/src/os/events.rs`: `SetWinEventHook` listening to `EVENT_OBJECT_CREATE` and `EVENT_OBJECT_DESTROY`, emits `"os:window-lifecycle"`) — **DONE**
- `[5.20]` Unit and integration tests (`src-tauri/src/os/mod.rs`: 4 Rust integration tests; `tests/os.test.ts`: 9 Vitest frontend tests) — **DONE**
- `[5.21]` Typed error taxonomy (`src-tauri/src/os/error.rs`: `OsError` enum covering all Win32 failure codes with `Display` and `Serialize`) — **DONE**

---

## 11. Phase 6 Task Log (Core Business Logic)
- `[6.1]` Write `StashService` — `stash_now()` (`src-tauri/src/core/stash_service.rs`: takes live snapshot, saves session with `is_frozen = true`, stores window records, minimizes windows, pushes to undo stack) — **DONE**
- `[6.2]` Write `StashService` — `restore_workspace(id)` (`src-tauri/src/core/stash_service.rs`: retrieves latest frozen session, queries window positions, restores via OS restore engine, tracks undo) — **DONE**
- `[6.3]` Write `StashService` — `quick_switch(from, to)` (`src-tauri/src/core/stash_service.rs`: atomic stash of current workspace followed immediately by restore of target workspace) — **DONE**
- `[6.4]` Write workspace limit enforcement (`src-tauri/src/core/workspace_manager.rs`: free-tier maximum 3 workspaces enforced with typed `CoreError::WorkspaceLimitExceeded(3)`) — **DONE**
- `[6.5]` Write `WorkspaceManager` — ordering (`src-tauri/src/core/workspace_manager.rs`: `reorder_workspaces()` updating `sort_order` in SQLite transaction) — **DONE**
- `[6.6]` Write `WorkspaceManager` — naming rules (`src-tauri/src/core/workspace_manager.rs`: 2..=40 chars, whitespace trimmed, case-insensitive uniqueness check) — **DONE**
- `[6.7]` Write auto-snapshot on interval (`src-tauri/src/core/auto_snapshot.rs`: parses `"5m"`, `"15m"`, `"30m"`, takes labeled snapshots, and prunes older ones keeping max 5) — **DONE**
- `[6.8]` Write session diff engine (`src-tauri/src/core/session_diff.rs`: compares base vs current windows, reporting added, removed, moved coordinates, and unchanged count) — **DONE**
- `[6.9]` Write restore conflict resolution (`src-tauri/src/core/types.rs`, `stash_service.rs`: `ConflictResolutionMode::OverwritePosition`, `SkipIfRunning`) — **DONE**
- `[6.10]` Write undo stack for stash operations (`src-tauri/src/core/undo_stack.rs`, `stash_service.rs`: bounded 5-item ring buffer with `undo_last_operation()` reversing stashes and restores) — **DONE**
- `[6.11]` Expose all StashService commands to Tauri (`src-tauri/src/core/commands.rs`: `cmd_stash_now`, `cmd_restore_workspace`, `cmd_quick_switch`, `cmd_undo_last_operation`, `cmd_get_undo_stack_size`, `cmd_create_workspace_validated`, `cmd_diff_live_with_session`, `cmd_trigger_auto_snapshot`) — **DONE**
- `[6.12]` Unit tests — StashService (`src-tauri/src/core/mod.rs`: `test_undo_stack_bounded_capacity`; `tests/core.test.ts`: Vitest API client tests) — **DONE**
- `[6.13]` Unit tests — workspace limit (`src-tauri/src/core/mod.rs`: `test_workspace_name_validation`, `test_workspace_limit_enforcement`) — **DONE**
- `[6.14]` Unit tests — session diff engine (`src-tauri/src/core/mod.rs`: `test_session_diff_engine_comprehensive` testing empty, identical, moved, added, and removed windows) — **DONE**

---

## 12. Phase 7 Task Log (Frontend — Dashboard & Live View)
- `[7.1]` Build `LiveWindowList` component (`src/components/LiveWindowList.tsx`: 32px compact desktop rows with PID, process name, window title, memory usage, elevation and minimize badges) — **DONE**
- `[7.2]` `LiveWindowList` process icon fetch & cache (`src/lib/processIcons.ts`: in-memory icon resolution caching mapping IDEs, browsers, terminals, file managers, and settings) — **DONE**
- `[7.3]` `LiveWindowList` sorting engine (`src/components/LiveWindowList.tsx`: supports sorting by RAM memory descending, title ascending, process name, and z-order) — **DONE**
- `[7.4]` `LiveWindowList` filtering (`src/hooks/useLiveDashboard.ts`: real-time search input filtering across window title, executable name, and PID) — **DONE**
- `[7.5]` `LiveWindowList` multi-selection (`src/components/LiveWindowList.tsx`: individual checkboxes, indeterminate select-all header, and selected count tracker) — **DONE**
- `[7.6]` Build `MemoryMeter` component (`src/components/MemoryMeter.tsx`: horizontal high-density bar showing used, available, total RAM and load percentage with emerald/warning/danger threshold color coding) — **DONE**
- `[7.7]` Build `ProcessCount` indicator (`src/components/ProcessCount.tsx`: live monospace tags displaying window count, unique process count, and active selection count) — **DONE**
- `[7.8]` Build `StashButton` primary CTA (`src/components/StashButton.tsx`: 36px high-density primary button with `Ctrl+Shift+N` shortcut hint, selection count badge, and loading state) — **DONE**
- `[7.9]` Build `StashButton` confirmation tooltip (`src/components/StashButton.tsx`: hover reveals live summary of windows and estimated RAM to be saved) — **DONE**
- `[7.10]` Wire Dashboard to live data (`src/hooks/useLiveDashboard.ts`: polling every 2.5s and real-time subscription to Tauri events `"os:foreground-changed"` and `"os:window-lifecycle"`) — **DONE**
- `[7.11]` Dashboard empty state (`src/components/DashboardStates.tsx`: `DashboardEmptyState` providing high-density guidance on minimized/cloaked windows) — **DONE**
- `[7.12]` Dashboard error state (`src/components/DashboardStates.tsx`: `DashboardErrorState` reporting OS subsystem errors and elevation requirements with retry button) — **DONE**

---

## 13. Phase 8 Task Log (Frontend — Workspaces View)
- `[8.1]` Build `WorkspaceCard` component (`src/components/WorkspaceCard.tsx`: compact 36px desktop row with color dot popover, slot index `#1..N`, timestamp, status badge, restore CTA with shortcut hint, session history trigger, inline rename, delete button) — **DONE**
- `[8.2]` Build `WorkspaceList` component (`src/components/WorkspaceList.tsx`: container rendering workspace card items, divider borders, empty state fallback) — **DONE**
- `[8.3]` Workspace create flow (`src/components/WorkspaceCreatorBar.tsx`: inline creation input bar with length validation 1..50, case-insensitive duplicate check, 8-dot color palette selection, Esc/Enter keyboard control) — **DONE**
- `[8.4]` Workspace rename flow (`src/components/WorkspaceCard.tsx`: inline editing mode triggered via double-click on row or rename icon button, Esc to cancel, Enter/blur to save) — **DONE**
- `[8.5]` Workspace delete flow (`src/components/WorkspaceList.tsx`: `WorkspaceDeleteModal` warning user of permanent session loss from SQLite before deletion) — **DONE**
- `[8.6]` Reordering (`src/components/WorkspaceCard.tsx`, `src/hooks/useWorkspaces.ts`: move up/down chevrons recalculating positions and persisting to SQLite via `api.reorderWorkspaces`) — **DONE**
- `[8.7]` Color picker (`src/components/WorkspaceColorPicker.tsx`: 8 preset obsidian/terminal colors `#10B981`, `#3B82F6`, `#8B5CF6`, `#EC4899`, `#F59E0B`, `#06B6D4`, `#14B8A6`, `#EF4444` in click-to-open popover) — **DONE**
- `[8.8]` Free tier lock UI (`src/components/WorkspaceList.tsx`: `FreeTierLockedSlot` rendering locked slot #4 with dashed border, lock icon, and Pro upgrade badge when >= 3 workspaces on free tier) — **DONE**
- `[8.9]` `SessionHistoryPanel` (`src/components/SessionHistoryPanel.tsx`: right sliding drawer showing past snapshot history for selected workspace with session name, date, window count, and RAM saved) — **DONE**
- `[8.10]` Session detail inspect (`src/components/SessionHistoryPanel.tsx`: "Inspect windows" toggle expanding saved window list with PID, process name, window title, and RAM consumption) — **DONE**
- `[8.11]` Session restore action (`src/components/SessionHistoryPanel.tsx`, `src/hooks/useWorkspaces.ts`: 1-click restore button invoking `api.restoreSessionById(sessionId)`) — **DONE**
- `[8.12]` Session delete action (`src/components/SessionHistoryPanel.tsx`, `src/hooks/useWorkspaces.ts`: snapshot delete button invoking `api.deleteSession(sessionId)` with reactive refresh) — **DONE**
- `[8.13]` Workspace restore action (`src/components/WorkspaceCard.tsx`, `src/hooks/useWorkspaces.ts`: restore CTA button with keyboard shortcut hints `Alt+1` through `Alt+9` invoking `api.restoreWorkspace(id)`) — **DONE**

---

## 14. Phase 9 Task Log (Frontend — Settings View)
- `[9.1]` General settings panel — **NEXT**
- `[9.2]` Stash behavior settings — **QUEUED**
- `[9.3]` Browser extension bridge toggle — **QUEUED**
- `[9.4]` Storage & database settings — **QUEUED**
- `[9.5]` Shortcut customization — **QUEUED**
- `[9.6]` License & activation panel — **QUEUED**
- `[9.7]` Danger zone — reset data — **QUEUED**
- `[9.8]` Wire settings to SQLite — **QUEUED**
- `[9.9]` Unit tests — Settings View — **QUEUED**
