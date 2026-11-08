# Nakraku Stash — Bug Tracker & Edge Case Triage Log

> **Document Version**: 1.0.0  
> **Schema Standard**: Strict Triage Protocol  
> **Lifecycle**: Updated per task turn via `context-memory-sync`

---

## 1. Bug Tracking Schema & Classification
Every issue, OS quirk, or unexpected runtime barrier encountered must be logged here immediately. Never hide, ignore, or silently bypass failures.

| Field | Description | Permitted Values |
|---|---|---|
| **Bug ID** | Unique sequential identifier | `BUG-001`, `BUG-002`, ... |
| **Severity** | Impact on system stability | `P0-Critical` (crash / data loss / panic)<br>`P1-High` (core feature failure)<br>`P2-Medium` (degraded UX or fallback used)<br>`P3-Low` (minor cosmetic or documentation defect) |
| **Component** | Subsystem domain | `Win32-OS`, `SQLite-DB`, `WebSocket-Bridge`, `Crypto-License`, `Frontend-UI`, `FigCraft-Canvas`, `Toolchain-CI` |
| **Status** | Resolution lifecycle state | `Open`, `In-Progress`, `Mitigated`, `Resolved`, `Closed` |
| **Root Cause** | Underlying technical flaw | FFI error code, race condition, serialization mismatch, OS permission |
| **Mitigation** | Permanent architectural fix | Verified code patch, typed error handling, fallback strategy |

---

## 2. Active Bug & Edge Case Triage Log

| Bug ID | Severity | Component | Description | Status | Root Cause & Mitigation Plan |
|---|---|---|---|---|---|
| **BUG-001** | `P2-Medium` | `Toolchain-CI` | Rust toolchain missing from default PowerShell PATH in freshly spawned sessions. | **Resolved** | Rust was installed at `~/.cargo/bin`, but child shells had stale `$env:PATH`. **Fix**: Added dynamic PATH injection in `scripts/check-env.ps1`. |
| **BUG-002** | `P1-High` | `Win32-OS` | `ERROR_ACCESS_DENIED` (5) when inspecting elevated (Administrator) windows from non-elevated Nakraku process. | **Mitigated** | Windows security boundary prevents unprivileged processes from calling `OpenProcess(PROCESS_QUERY_INFORMATION)` on elevated processes. **Mitigation**: Handle error gracefully in `RawWindow::from_hwnd()`, mark row with `is_elevated: true`, and provide user hint to run Nakraku as Administrator if elevated management is desired. |
| **BUG-003** | `P2-Medium` | `Win32-OS` | Chromium multi-process architecture exposes invisible/dummy HWNDs (`Chrome_WidgetWin_0`, `Intermediate D3D Window`). | **Mitigated** | Browsers spawn helper windows for GPU rasterization and tabs. **Mitigation**: Implement strict filtering in `window_enum.rs`: check `IsWindowVisible()`, verify non-empty window title, and ensure dimensions `width > 0 && height > 0`. |
| **BUG-004** | `P2-Medium` | `Win32-OS` | Negative coordinate bounds when restoring windows on secondary monitors placed to the left/above primary monitor. | **Mitigated** | Windows virtual screen coordinates can be negative for non-primary monitors. **Mitigation**: Use signed `i32` for `x` and `y` coordinates in Rust structs and TypeScript IPC schemas; avoid unsigned `u32` clamping. |
| **BUG-005** | `P2-Medium` | `WebSocket-Bridge` | Companion browser extension disconnects when browser enters sleep/efficiency mode. | **Mitigated** | Background service workers in MV3 become idle after 30 seconds. **Mitigation**: Implement 10-second WebSocket heartbeat (`HEARTBEAT` ping/pong) and exponential backoff reconnect logic in `background.js`. |
| **BUG-006** | `P3-Low` | `Toolchain-CI` | `lefthook` fails with code 128 if git repository is uninitialized. | **Resolved** | Git repository was initialized via `git init` in Task 0.11, resolving hook runner execution. |
| **BUG-007** | `P2-Medium` | `Frontend-UI` | Oxlint `max-lines-per-function` (50 lines) triggered in settings components (`useSettings.ts`, `LicensingSection.tsx`, `DangerZoneSection.tsx`). | **Resolved** | Complex modals and action handlers caused functions to exceed 50 lines. **Fix**: Decomposed forms into subcomponents (`PurgeModal`, `ResetModal`, `ImportModal`, `DangerZoneRows`, `useBackupAndPurge`). |
| **BUG-008** | `P3-Low` | `Frontend-UI` | Oxlint `no-negated-condition` flagged on `!isPro ? (...) : (...)` ternary. | **Resolved** | Anti-slop lint rules disallow negated conditions in ternary expressions. **Fix**: Inverted condition to `isPro ? (...) : (...)`. |
| **BUG-009** | `P1-High` | `WebSocket-Bridge` | Tokio and Futures-util compile errors in `ws/server.rs` (`missing crate tokio`, `cannot find method split`). | **Resolved** | Tokio was an indirect dependency without `full` features enabled. **Fix**: Explicitly added `tokio = { version = "1.54", features = ["full"] }` and `futures-util` to `src-tauri/Cargo.toml`. |
| **BUG-010** | `P2-Medium` | `WebSocket-Bridge` | Browser tab stashing failed on Microsoft Edge and Brave when attempting to close internal `edge://*` and `brave://*` URLs. | **Resolved** | Stash filter only checked `chrome://` prefix. **Fix**: Created universal `isInternalUrl()` checking `chrome://`, `edge://`, `brave://`, `about:`, `*-extension://`, and used browser-agnostic `chrome.tabs.create({})`. |
| **BUG-011** | `P2-Medium` | `Frontend-UI` | Oxlint `react(set-state-in-effect)` error in `useWsBridgeStatus.ts`. | **Resolved** | Invoking `refresh()` directly within `useEffect` causes cascading render warnings. **Fix**: Wrapped polling invocation in asynchronous helper with component mount lifecycle flag. |
| **BUG-012** | `P2-Medium` | `Frontend-UI` | UI Status Bar and Settings did not dynamically reflect real-time WebSocket connection state of the browser extension. | **Resolved** | `StatusBar` used hardcoded default props, while `ExtensionBridgeSection` only checked configuration state. **Fix**: Integrated `useWsBridgeStatus` hook to feed live client telemetry into `StatusBar` and Settings. |

---

## 3. Edge Case Mitigation Playbook

### 3.1 Ghost & Zombie Windows
* **Symptom**: Process has terminated, but window handle (`HWND`) remains valid for several milliseconds in Windows message queue.
* **Protocol**: Before calling `ShowWindow` or `SetWindowPos`, invoke `IsWindow(hwnd)`. If false, remove from active snapshot immediately.

### 3.2 Display Resolution & DPI Changes
* **Symptom**: Window stashed on a 4K display (150% scaling) is restored on a 1080p laptop display (100% scaling), resulting in the window appearing off-screen.
* **Protocol**: Clamping engine in `window_restore.rs` checks target screen bounds via `GetMonitorInfoW`. If saved coordinates exceed available monitor rect, window is repositioned to center with default bounds (900×600).

### 3.3 Missing Executable on Restore
* **Symptom**: An application was uninstalled or moved after being stashed in a session.
* **Protocol**: `launch_process()` verifies executable path via `Path::exists()` before invoking `CreateProcessW`. If missing, surface a non-blocking toast warning: *"Executable not found: {path}. Skipping window restore."*
