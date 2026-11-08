# Nakraku Stash — Public Release Announcement Drafts

This document contains publication-ready announcement copy for the public release of **Nakraku Stash v0.1.0**.

---

## 1. Hacker News (Show HN)

**Title**: Show HN: Nakraku Stash – Fast, high-density window stashing for Windows in Rust & Tauri

**Post Body**:

Hey HN!

I built Nakraku Stash because my desktop was constantly drowning in 20+ open windows across multiple monitors, consuming 16+ GB of RAM even when I was doing something completely different. Existing virtual desktop tools on Windows don't actually suspend or freeze applications, and browser extensions only care about tabs.

Nakraku Stash is an open-source, ultra-compact desktop workspace utility for Windows 10/11:
- **Instant Session Stashing**: Hit `Ctrl+Shift+N`, and all visible windows across all monitors are snapshotted, minimized, and recorded into a local SQLite database in ~145 ms.
- **Sub-Second Restore**: Hit `Ctrl+Shift+R` or click a workspace, and windows return to their exact pixel coordinates (`SetWindowPos`, `WINDOWPLACEMENT`) in under ~420 ms. If an app was closed, it relaunches automatically.
- **Companion Browser Extension (MV3)**: Bridges Chrome, Edge, and Brave over a local loopback WebSocket (`ws://127.0.0.1:48123`) to save open URLs and close tabs during stash, reopening them on restore.
- **High-Density Desktop UI**: Built with Obsidian dark tokens (`#080A0E`), 38px frameless titlebar, and 32px monospace data rows. No fluffy SaaS cards or inflated web padding.
- **Zero-Cloud & 100% Offline**: Zero telemetry, no cloud accounts. Even the Pro licensing runs offline via asymmetric Ed25519 signatures validated against hardware machine IDs stored in the Windows Credential Manager.
- **Lean Footprint**: Native Rust backend consumes ~22 MB RAM, and the code-split frontend bundle is only 113.8 kB.

Tech stack: Tauri v2 + Rust (`windows-sys` v0.59) + React 19 + TypeScript + Vite + SQLite (WAL mode).

GitHub: https://github.com/nakraku/stash  
Website / Downloads: https://nakraku.app  

Would love your feedback on the Win32 coordinate restoration and multi-monitor clamping behavior!

---

## 2. Reddit

### Subreddit: r/rust
**Title**: [Project] Nakraku Stash – High-density Windows workspace & window stashing engine built with Rust, windows-sys, and Tauri v2

**Body**:
Hey everyone! Wanted to share a desktop tool I've been building in Rust: **Nakraku Stash**.

It snapshots running Win32 application windows, virtual monitor coordinates, and browser tabs, minimizing them to free up screen real estate and RAM, and restores them later in milliseconds.

Some interesting Rust details from the implementation:
- Used `windows-sys` v0.59 for safe Win32 FFI (`EnumWindows`, `DwmGetWindowAttribute`, `K32GetProcessMemoryInfo`, `SetWinEventHook`).
- Enumeration hot-path caching: By caching process telemetry per PID for 1 second during enumeration passes, `EnumWindows` cycle time dropped from 34.8ms to 3.2ms (an 11x speedup).
- Embedded SQLite running in WAL mode with 256MB memory-mapped I/O (`PRAGMA mmap_size = 268435456`).
- Bounded 5-slot in-memory undo stack for reversible stashing operations.
- Offline Ed25519 asymmetric signature verification for licensing with machine hardware fingerprints stored in the native Windows Credential Manager keyring.
- Zero unhandled panics or unwrap() in OS/DB pathways.

Repo: https://github.com/nakraku/stash  
Feedback, PRs, and critiques are very welcome!

---

### Subreddit: r/windows
**Title**: [Release] Nakraku Stash – Instant desktop workspace stashing & RAM relief for Windows 10/11 (Free & Open Source)

**Body**:
Tired of 30 open windows cluttering your taskbar and eating 15GB of RAM?

Nakraku Stash is a lightweight Windows utility that lets you freeze cluttered workspaces with a single hotkey (`Ctrl+Shift+N`) and restore them later with pixel-perfect window positions (`Ctrl+Shift+R`).

Features:
- Works with standard Windows user permissions (no Administrator prompt needed for normal apps).
- Saves multi-monitor setups (supports negative monitor offsets).
- Companion browser extension for Chrome, Edge, and Brave closes and restores tabs.
- 100% local: zero tracking, no cloud telemetry, SQLite WAL storage.
- Non-admin NSIS installer & enterprise MSI available.

Download: https://github.com/nakraku/stash/releases

---

## 3. Twitter / X Thread

**Tweet 1 (Hook)**:  
Desktop clutter is killing your focus and eating 16 GB of RAM.

Introducing Nakraku Stash: an ultra-compact, high-density window stashing engine for Windows 10 & 11.

Freeze workspaces in 145 ms. Restore coordinates in milliseconds.

100% open-source & zero-cloud. 🧵👇

**Tweet 2 (Core Tech)**:  
Unlike virtual desktops that keep everything running, Nakraku Stash:
• Snapshots running windows via Win32 DWM
• Minimizes windows to declutter your workflow
• Reopens closed apps and restores exact coordinates on restore
• Syncs Chrome/Edge/Brave tabs via loopback WebSocket

**Tweet 3 (Performance & Design)**:  
Obsidian dark theme (`#080A0E`), 38px custom titlebar, 32px monospace rows.
• 113.8 kB core JS bundle (71.3% reduction)
• < 22 MB native idle RAM
• 60 FPS table virtualization for 150+ open windows
• SQLite WAL mode with 256 MB memory-mapped I/O

**Tweet 4 (Privacy & Links)**:  
Zero telemetry. Zero network calls. Offline Ed25519 licensing.

Download the NSIS installer or build from source:
⭐ GitHub: https://github.com/nakraku/stash
🌐 Site: https://nakraku.app

Built with Tauri v2, Rust, and React 19.

---

## 4. Product Hunt

* **Tagline**: Freeze cluttered Windows desktops. Reclaim RAM. Restore in ms.
* **Short Description**: Nakraku Stash is an open-source, high-density workspace stashing utility for Windows 10/11. Snapshot open windows, monitor coordinates, and browser tabs with one hotkey, and restore them in milliseconds.
