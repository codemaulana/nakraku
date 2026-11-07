# Nakraku Stash — Agent Router & Master Execution Controller

## 1. Core Directives & Invariants
1. **Phased Execution Invariant**: Execute exactly ONE discrete task per prompt turn. Never combine multiple roadmap tasks into a single turn. Complete the task, run guardrails, record context, and verify with the user before proceeding to the next task.
2. **Deep Recursive Brainstorming Invariant**: For any complex, architectural, or OS-sensitive task, the agent MUST execute recursive multi-round brainstorming (`deep-recursive-brainstormer`), red-teaming, and trade-off comparison before writing code. Never produce superficial, first-thought code.
3. **Anti-Slop AI Invariant (Code)**: Zero narrative AI commentary (`// Filter 1`, `{/* Header */}`, `// Initialize...`). Write clean, self-documenting code with type signatures. Preserve functional docstrings only.
4. **Anti-Slop UI Invariant (Design)**: High-density desktop utility metrics only. 32px–36px compact rows, 38px frameless custom titlebar, monospace metrics font (`JetBrains Mono` / `Cascadia Code`), Obsidian palette (`#080A0E` background, `#10B981` emerald accent). Never use puffy SaaS card layouts or inflated web padding.
5. **FigCraft Vibe Coding Invariant**: UI designs must be authored, previewed, and maintained in `c:\Nakraku\NakrakuUI.figcraft` via the FigCraft MCP server and CLI. Every React component must maintain 1:1 visual parity with its FigCraft frame.
6. **Rust Safety Invariant**: Zero unhandled `unwrap()` or `expect()` in Win32 OS calls or SQLite queries. Every OS operation must return typed `Result<T, AppError>`.
7. **TypeScript Strictness Invariant**: Zero `any`. All IPC payloads and state shapes must be strictly typed and validated at runtime with Zod.
8. **Continuous Verification Loop**: Never declare a task complete without executing the verification protocol (build, typecheck, guardrail scan). If violations exist, self-correct in a loop until 0 errors remain.

---

## 2. Current Execution State
* **Active Phase**: Phase 1 — FigCraft UI/UX Design & Vibe Coding (MCP)
* **Completed Tasks**:
  * **Phase 0: Foundations & Toolchain (Tasks 0.1 – 0.15)** — **100% COMPLETE** (Git commit `15cd469`, Release tag `v0.0.1-scaffold`)
  * **Task 1.1: FigCraft MCP & CLI bridge setup** — **100% COMPLETE** (Verified live MCP connection in IDE, set page background to `#080A0E`, synchronized with `NakrakuUI.figcraft`, CLI verified via `figcraft-cli info`)
  * **Task 1.2: Design Tokens in FigCraft** — **100% COMPLETE** (Populated 28 variables: 16 Obsidian colors, 12 spacing/metrics; 24 styles: 8 typography, 16 paints in `NakrakuUI.figcraft`)
  * **Task 1.3: Canvas Artboard & 38px Titlebar** — **100% COMPLETE** (Created 900x600 Desktop Window frame, 38px frameless titlebar with window controls, verified PNG render)
  * **Task 1.4: Sidebar Navigation Frame** — **100% COMPLETE** (Designed 200px collapsible sidebar with 32px nav rows, badges, RAM freeze telemetry, verified PNG render)
  * **Task 1.5: Dashboard & Live Window Table** — **100% COMPLETE** (Designed 32px row window list, PID/RAM monospace metrics, RAM meter bar, 28px Stash CTA, verified PNG render)
  * **Task 1.6: Spatial Monitor Minimap** — **100% COMPLETE** (Designed multi-display layout visualizer with 2 monitors, live window boxes, HWND coordinate inspector, verified 1850x600 PNG render)
  * **Task 1.7: Workspace Cards & Quick Switcher** — **100% COMPLETE** (Designed 900x600 Workspaces view frame at x:2000, 3 x 42px workspace rows, drag handles, color tags, Free Tier 3/3 banner, verified 2800x600 PNG render)
* **Next Immediate Task**: Task 1.8 — Command Palette (Ctrl+K) Overlay (design search modal with fuzzy results & kbd pills)
* **Total Roadmap**: 288 tasks across 21 phases (Detailed in `nakraku_full_task_breakdown.md`)

---

## 3. Master 21-Phase Roadmap Summary
* **Phase 0: Foundations & Toolchain** (Tasks 0.1 – 0.15) — Scaffolding, environment audit, Tauri v2 init, security CSP, linters, pre-commit hooks, guardrails v1, living documentation.
* **Phase 1: FigCraft UI/UX Design & Vibe Coding (MCP)** (Tasks 1.1 – 1.10) — Connect FigCraft MCP server, design Obsidian tokens, build 900x600 frameless shell, live table (32px rows), minimap, palette, and settings in `NakrakuUI.figcraft`, render PNG previews, code-connect mapping.
* **Phase 2: React Design System & Component Library** (Tasks 2.1 – 2.28) — Design tokens (`tokens.css`), 28 high-density atomic components, custom 38px titlebar, layout shells, accessibility, visual QA gallery.
* **Phase 3: Application Shell & Navigation** (Tasks 3.1 – 3.18) — Lightweight client router, views, global shortcuts, Command Palette (Ctrl+K), system tray, autostart, window geometry persistence.
* **Phase 4: Data Layer & Local Database** (Tasks 4.1 – 4.17) — SQLite schema, migrations, `tauri-plugin-sql`, Rust repositories, typed IPC commands, Zod schemas, DB backups.
* **Phase 5: Win32 OS Engine (Rust)** (Tasks 5.1 – 5.21) — `EnumWindows`, process inspection, window coordinates, minimize/restore engine, process launch, UAC handling, typed `OsError`.
* **Phase 6: Core Business Logic** (Tasks 6.1 – 6.14) — Stash orchestration, restore session, quick switch, 3-workspace free tier limit, auto-snapshot timer, session diff engine, undo stack.
* **Phase 7: Frontend — Dashboard & Live View** (Tasks 7.1 – 7.12) — Real-time window list (32px rows), live memory meter, process count, 1-click Stash CTA, event listeners.
* **Phase 8: Frontend — Workspaces View** (Tasks 8.1 – 8.13) — Workspace list, inline rename, delete confirmation, drag-to-reorder, color tagger, session history slide-over.
* **Phase 9: Frontend — Settings View** (Tasks 9.1 – 9.9) — General, stash behavior, browser extension bridge, storage/backup, shortcuts, license activation, danger zone.
* **Phase 10: Browser Extension (MV3)** (Tasks 10.1 – 10.16) — Manifest v3, background service worker, local WebSocket bridge (`ws://127.0.0.1:48123`), tab stash/restore protocol, popup UI.
* **Phase 11: Licensing & Monetization** (Tasks 11.1 – 11.15) — Offline Ed25519 signature verification, hardware machine ID, OS keyring storage, free-tier gate, Polar/Lemon Squeezy webhook.
* **Phase 12: Error Handling & Telemetry** (Tasks 12.1 – 12.10) — Typed `AppError`, React ErrorBoundary, toast notifications, rolling log files, crash dump generator.
* **Phase 13: Performance & Optimization** (Tasks 13.1 – 13.10) — Bundle analyzer, code splitting, list virtualization, SQLite WAL tuning, cold start (<400ms), stash latency (<300ms).
* **Phase 14: Testing Suite** (Tasks 14.1 – 14.20) — Vitest frontend tests, `cargo test` Rust unit/integration tests, E2E flows, edge cases (0 windows, 100+ windows, multi-monitor).
* **Phase 15: Security Audit** (Tasks 15.1 – 15.10) — IPC allowlist audit, CSP compliance, local WS origin validation, keyring safety, dependency audit (`cargo audit`, `npm audit`).
* **Phase 16: Installer & Distribution** (Tasks 16.1 – 16.12) — NSIS and MSI packaging, app icons, EV code signing pipeline, auto-updater via GitHub Releases.
* **Phase 17: CI/CD Pipeline** (Tasks 17.1 – 17.8) — GitHub Actions PR checks, guardrail runner, release builds, Dependabot, performance regression gate.
* **Phase 18: Documentation** (Tasks 18.1 – 18.14) — README, CONTRIBUTING, CHANGELOG, ARCHITECTURE, WIN32-API-SURFACE, WS-PROTOCOL, SCHEMA, demo recordings.
* **Phase 19: Open Source Hygiene** (Tasks 19.1 – 19.9) — MIT license, Code of Conduct, issue/PR templates, triage guide, community setup.
* **Phase 20: Landing Page** (Tasks 20.1 – 20.7) — Fast landing page, hero preview, feature grid, free vs pro comparison, download links.

---

## 4. Agent Skills Registry
The project utilizes specialized skills in `.agents/skills/`:
* `deep-recursive-brainstormer`: Mandatory recursive brainstorming and architectural reasoning engine for complex tasks. Evaluates multi-perspective trade-offs and adversarial edge cases before code execution.
* `phased-task-executor`: Enforces step-by-step sequential progress along the 288-task roadmap, gating complex tasks through deep brainstorming.
* `continuous-verification-loop`: Repetitive testing and validation engine that refuses to finish until all outputs are complete, bug-free, and guardrail-compliant.
* `anti-slop-guard`: Enforces zero narrative AI comments, zero `any`, zero unhandled `unwrap()`, and strict 32px-36px desktop UI density.
* `figcraft-vibe-coder`: Interactive UI/UX design, visual prototyping, and code-connect workflow using the FigCraft MCP server and CLI for `NakrakuUI.figcraft`.
* `context-memory-sync`: Synchronizes progress, session state, and known bugs into `docs/CONTEXT.md` and `docs/BUGS.md`.
* `win32-desktop-engine`: Domain-specific guide for Tauri v2, Rust Win32 FFI, process memory, and local WebSocket IPC.
* `high-density-design-system`: Specifications and tokens for high-density native desktop interfaces.
* `repo-hygiene-harness`: Automated pre-commit scripts, linters, and verification test harnesses.

---

## 5. Standard Operating Procedure (SOP) Per Task
For every task in the roadmap, the agent MUST execute this exact loop:
1. **Pre-Flight**:
   - Check current task in `AGENTS.md` and `docs/CONTEXT.md`. Verify prerequisite files exist.
   - **Complexity Gate**: If the task involves Win32, DB, cryptography, state orchestration, or spatial UI, execute `deep-recursive-brainstormer` (4-round analysis) before proceeding.
2. **Execute**: Create or edit ONLY the files required for the single active task, adhering to the locked brainstorm specification.
3. **Verify**:
   - Run type checks / syntax checks (`tsc --noEmit`, `cargo check`).
   - Run `scripts/guardrails.ps1` (or anti-slop pattern scanner).
   - Verify self-documenting code without AI filler comments.
4. **Self-Correct**: If any check fails, fix the code immediately and re-run verification until 0 errors remain.
5. **Update Memory**: Log task completion in `docs/CONTEXT.md` and any known issues in `docs/BUGS.md`.
6. **User Gate**: Report exact changes and verification output, then await user approval before moving to the next task.
