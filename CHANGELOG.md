# Changelog

All notable changes to the Nakraku Stash project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-11-08

### Initial Release

Nakraku Stash v0.1.0 marks the initial public release of the ultra-compact, high-density workspace stashing utility for Windows 10/11.

### Added

#### Core Engine & Win32 OS Subsystem (Rust)
- Safe Win32 window enumeration using `EnumWindows` and `windows-sys` v0.59.
- System window and cloaked window exclusion filter (`DWMWA_CLOAKED`, `Progman`, Shell trays, Task View).
- Process telemetry inspector extracting process memory (`K32GetProcessMemoryInfo`) and executable paths (`QueryFullProcessImageNameW`).
- Session snapshot and restore engine supporting multi-display coordinate systems, `WINDOWPLACEMENT`, and `SetWindowPos`.
- Unprivileged process launcher (`CreateProcessW`) with missing executable detection and telemetry fallback.
- Win32 asynchronous OS event hooks (`SetWinEventHook`) for real-time foreground window changes and window lifecycle events.
- Session diff engine comparing live state against stored snapshots with added, removed, and repositioned delta tracking.
- Bounded 5-slot in-memory undo stack for reversible workspace stash operations (`Ctrl+Z`).

#### Data Layer & Local Storage
- Embedded SQLite database engine configured in Write-Ahead Logging (`WAL`) mode with `foreign_keys = ON`.
- Database schema migrations (`001_init.sql` for workspaces/sessions/windows/tabs, `002_settings.sql` for key-value preferences).
- 6 type-safe Rust repositories: `workspace_repo`, `session_repo`, `window_repo`, `tab_repo`, `settings_repo`, and backup utility.
- Typed Tauri IPC commands with full bidirectional runtime schema validation via Zod on TypeScript client.
- Automated database backup utility (`backup_db`) triggering before destructive wipe operations.

#### User Interface & Design System (React 19 & Tailwind CSS v4)
- High-density native desktop layout featuring strict 32px/36px compact rows and 38px custom frameless titlebar.
- Obsidian color palette (`#080A0E` background, `#10B981` emerald accent, `#141820` surface).
- Lightweight in-memory hash router without third-party router bloat.
- Real-time `Dashboard` with live window table, memory consumption meter, process counter, and 1-click Stash CTA.
- `Workspaces` manager with inline rename, deletion confirmation modal, color tag picker, drag-and-drop reordering, and sliding session history inspector.
- High-density `CommandPalette` (`Ctrl+K`) with fuzzy action filtering and keyboard navigation.
- System tray integration with workspace count badge, background minimize-to-tray, and global shortcuts (`Ctrl+Shift+N`, `Ctrl+Shift+R`).
- Native 36px list virtualization engine (`useVirtualList`) and `React.memo` optimization rendering 150+ windows at a locked 60 FPS.

#### Browser Companion Extension (Manifest V3)
- Chrome, Edge, and Brave companion extension with background service worker and loopback WebSocket bridge.
- Local loopback WebSocket server (`ws://127.0.0.1:48123`) with RFC 6455 framing and 10s keepalive heartbeats.
- Bidirectional messaging protocol (`GET_TABS`, `TABS_LIST`, `STASH_TABS`, `RESTORE_TABS`, `CONNECTION_STATUS`).
- High-density 320x400 extension popup matching the desktop application Obsidian theme.
- Sideload packaging script (`npm run build:extension`) outputting `dist-extension.zip`.

#### Licensing & Security
- 100% offline asymmetric digital signature verification via Ed25519 (RFC 8032).
- Non-reversible hardware machine ID fingerprinting (SHA-256 over BIOS + disk serials with domain salt).
- Secure license storage via Windows Credential Manager (`keyring` crate) instead of plaintext files.
- Free tier enforcing 3 workspace limit with seamless Pro upgrade flow.
- Local WebSocket origin validation rejecting any requests originating from untrusted web domains.
- Strict Content Security Policy (`script-src 'self'`) with zero `unsafe-eval` or external script execution.

#### Distribution, Packaging & CI/CD
- Non-administrator NSIS per-user installer (`Nakraku-Stash-Setup-x64.exe`).
- WiX-based MSI enterprise installer package with RFC 4122 upgrade GUIDs.
- Automated code signing pipeline (`scripts/sign.ps1`) with RFC 3161 dual timestamping.
- In-app update checker and UI notification bar backed by `tauri-plugin-updater` and GitHub Releases.
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`) running parallel quality, test, build, and performance regression gates.
- Automated Dependabot configuration for `npm`, `cargo`, and `github-actions`.

### Performance Optimizations
- Reduced production frontend bundle by **71.3%** (from 395.1 kB down to 113.8 kB) through dynamic route code splitting.
- SQLite WAL configuration with 256 MB memory-mapped I/O (`PRAGMA mmap_size = 268435456`) and 64 MB page cache.
- Win32 PID process telemetry caching with 1-second TTL yielding an 11x speedup (enumeration down to 3.2 ms).
- Window table rendering optimized to sustain 60 FPS under 150+ active windows.
- Automated CI performance regression gate asserting main JS bundle < 200 kB and session diff latency < 15 ms.

[0.1.0]: https://github.com/nakraku/stash/releases/tag/v0.1.0
