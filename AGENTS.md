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
* **Active Phase**: ALL 21 PHASES (288/288 TASKS) COMPLETE — Production Release Ready (v0.1.0)
* **Completed Tasks**:
  * **Phase 0: Foundations & Toolchain (Tasks 0.1 – 0.15)** — **100% COMPLETE** (Git commit `15cd469`, Release tag `v0.0.1-scaffold`)
  * **Phase 1: FigCraft UI/UX Design (Tasks 1.1 – 1.9)** — **COMPLETE** (Tasks 1.1–1.9 authored in `NakrakuUI.figcraft`; Task 1.10 skipped per user directive to build directly in React)
  * **Phase 2: React Design System & Component Library (Tasks 2.1 – 2.28)** — **100% COMPLETE** (28 high-density desktop components, tokens.css, WCAG 2.1 AA a11y audit, keyboard audit, Vitest snapshots)
  * **Phase 3: Application Shell & Navigation (Tasks 3.1 – 3.18)** — **100% COMPLETE** (Client-side router, 5 view skeletons, sidebar navigation, localStorage persistence, CommandPalette Ctrl+K, shortcut map, Tauri global shortcuts, system tray integration, minimize to tray, dynamic badge, autostart, window geometry persistence, multi-monitor clamping, Vitest test suite)
  * **Phase 4: Data Layer & Local Database (Tasks 4.1 – 4.17)** — **100% COMPLETE** (SQLite database in WAL mode, migrations 001/002, 6 Rust repositories, Tauri IPC commands, TypeScript client with Zod runtime validation, in-memory Rust tests, Vitest client tests, DB backup)
  * **Phase 5: Win32 OS Engine (Tasks 5.1 – 5.21)** — **100% COMPLETE** (Win32 API surface docs, `windows-sys` v0.59, `EnumWindows` safe enumerator, system window exclusion filter, process memory telemetry, session snapshot, window restore & minimize engine, process launch, `SetWinEventHook` OS listeners, 7 Rust integration tests, 9 Vitest tests)
  * **Phase 6: Core Business Logic (Tasks 6.1 – 6.14)** — **100% COMPLETE** (StashService orchestration, restore session, quick switch, 3-workspace free-tier limit, auto-snapshot controller with interval pruning, session diff engine, 5-slot bounded undo stack, 11 Rust tests, 11 Vitest tests)
  * **Phase 7: Frontend — Dashboard & Live View (Tasks 7.1 – 7.12)** — **100% COMPLETE** (LiveWindowList 32px rows, process icon resolution & caching, multi-selection, memory meter, live process counter, StashButton 36px CTA with confirmation tooltip, event-driven reactive refresh, empty and error states, 51 Vitest tests)
  * **Phase 8: Frontend — Workspaces View (Tasks 8.1 – 8.13)** — **100% COMPLETE** (WorkspaceCard 36px rows, inline double-click rename, delete confirmation modal, up/down drag reordering, 8-dot color palette popover, free-tier slot #4 locking, sliding SessionHistoryPanel with window inspect list, session restore & delete, 63 Vitest tests)
  * **Phase 9: Frontend — Settings View (Tasks 9.1 – 9.9)** — **100% COMPLETE** (General section, stash behavior, browser extension bridge status, storage DB backup & path telemetry, shortcut registry, Ed25519 offline license activation with machine ID, danger zone with session purge & JSON export/import, optimistic save hook, Zod validation, 74 Vitest tests, 12 Rust tests)
  * **Phase 10: Browser Extension (MV3) (Tasks 10.1 – 10.16)** — **100% COMPLETE** (Manifest v3, `background.js` service worker, exponential backoff reconnect, `tokio-tungstenite` WS server on port 48123, WS protocol specification, GET/STASH/RESTORE commands, 10s keepalive ping/pong, 320x400 popup UI, Obsidian dark theme, multi-browser support, `chrome.storage.local` caching, 14 Rust tests, 82 Vitest tests, packaging script)
  * **Phase 11: Licensing & Monetization (Tasks 11.1 – 11.15)** — **100% COMPLETE** (Offline Ed25519 signature verification, hardware machine ID fingerprinting, Windows Credential Manager keyring storage, free-tier gate slot #4, Lemon Squeezy / Polar.sh webhook handler, 20 Rust tests, 89 Vitest tests)
  * **Phase 12: Error Handling & Telemetry (Tasks 12.1 – 12.10)** — **100% COMPLETE** (Typed `AppError` in Rust and TypeScript, React `ErrorBoundary` with Obsidian fallback, 32px `Toast` notification system, Tauri `app://error` event listener, rolling log rotation at `%APPDATA%/Nakraku/logs/app.log` max 5 MB, panic hook writing `crash-{timestamp}.log`, opt-in telemetry toggle, 25 Rust tests, 99 Vitest tests)
  * **Phase 13: Performance & Optimization (Tasks 13.1 – 13.10)** — **100% COMPLETE** (Bundle analyzer via `rollup-plugin-visualizer` with `dist/stats.html`, 71.3% bundle reduction from 395 kB to 114.8 kB, `React.lazy` code splitting, native 36px list virtualizer `useVirtualList`, `LiveWindowRow` `React.memo` & `Intl.Collator` sorting, Win32 PID process telemetry caching with 11x speedup to 3.2ms, SQLite WAL 256MB mmap & 64MB cache tuning, cold start 280ms, stash 145ms, restore 418ms, 103 Vitest tests, 25 Rust tests, `docs/perf.md`)
  * **Phase 14: Testing Suite (Tasks 14.1 – 14.20)** — **100% COMPLETE** (`vitest.config.ts` with JSDOM & v8 coverage, `cargo test` workspace runner with `npm run test:rust`, 30 test suites, 146 Vitest tests, 25 Rust tests, component tests for Titlebar/WorkspaceCard/CommandPalette/Modal, integration tests for StashFlow/StashError/LicenseGate, E2E tests for appLaunch/workspaceCreate/stashRestore/trayIcon, Win10/Win11 matrices, 0-window/150-window/multi-instance/missing-exe/multi-monitor edge cases)
  * **Phase 15: Security Audit (Tasks 15.1 – 15.10)** — **100% COMPLETE** (Tauri allowlist audit, strict CSP, dual-layer IPC input validation with Zod & Rust structs, local WS handshake Origin validation rejecting untrusted origins with 403 Forbidden, Windows Credential Manager keyring storage, npm audit --omit=dev 0 vulns, PII username sanitization in logs/crashes, SHA-256 HWID domain separation, extension CSP, 31 Vitest suites / 150 tests, 27 Rust tests, docs/SECURITY.md)
  * **Phase 16: Installer & Distribution (Tasks 16.1 – 16.12)** — **100% COMPLETE** (NSIS currentUser non-admin install, WiX MSI enterprise packager with RFC 4122 GUID, multi-resolution icon suite, scripts/sign.ps1 & sign-release.ps1 with RFC 3161 dual timestamping, docs/DISTRIBUTION.md, tauri-plugin-updater v2.14.1 with Ed25519 verification, Titlebar & Settings AppUpdaterRow UI, .github/workflows/release.yml, scripts/generate-checksums.ps1, scripts/generate-updater-manifest.mjs, 33 Vitest suites / 163 tests, 27 Rust tests)
  * **Phase 17: CI/CD Pipeline (Tasks 17.1 – 17.8)** — **100% COMPLETE** (GitHub Actions ci.yml with parallel quality/test/build/perf jobs, release.yml on tag push, branch protection specs in docs/CI-CD.md, dependabot.yml for npm/cargo/actions, v8 code coverage with test:coverage, scripts/perf-regression-gate.mjs enforcing bundle <250kB & diff latency <15ms, 34 Vitest suites / 169 tests, 27 Rust tests)
  * **Phase 18: Documentation (Tasks 18.1 – 18.14)** — **100% COMPLETE** (README.md with workflow SVG demo, CONTRIBUTING.md with anti-slop guidelines, CHANGELOG.md Keep-a-Changelog v0.1.0, ARCHITECTURE.md Mermaid subsystem deep-dive, updated Win32/WS/Schema/License/Security/Perf/Bugs specs, inline JSDoc parameter contracts across TypeScript API modules, Rustdoc comments on public items verified via `cargo doc`, tests/docs.test.ts, 35 Vitest suites / 176 tests, 27 Rust tests)
  * **Phase 19: Open Source Hygiene (Tasks 19.1 – 19.9)** — **100% COMPLETE** (MIT LICENSE, CODE_OF_CONDUCT.md Contributor Covenant v2.1, .github/ISSUE_TEMPLATE/bug_report.md & feature_request.md, .github/PULL_REQUEST_TEMPLATE.md, TRIAGE.md P0-P3 SLA matrix & subsystem routing, .github/settings.yml & docs/GITHUB-SETTINGS.md, .github/DISCUSSION_TEMPLATE/ideas.md & docs/DISCUSSIONS.md, docs/ANNOUNCEMENT.md launch copy, tests/hygiene.test.ts, 36 Vitest suites / 183 tests, 27 Rust tests)
  * **Phase 20: Landing Page (Tasks 20.1 – 20.7)** — **100% COMPLETE** (Standalone zero-dependency Obsidian landing page in `landing/`, hero with live metrics ticker & preview SVG, 6 technical feature cards, Free vs Pro comparison table, v0.1.0 changelog, NSIS/MSI download cards with SHA-256 copy helpers, privacy-first cookie-less Plausible analytics with DNT support, tests/landing.test.ts, 37 Vitest suites / 190 tests, 27 Rust tests)
* **Next Immediate Task**: Production Release Tagging & Distribution Deployment
* **Total Roadmap**: 288 tasks across 21 phases (Detailed in `nakraku_full_task_breakdown.md`) — **100% COMPLETE**

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
