# Nakraku Stash — Issue & Pull Request Triage Guide

This document defines the formal triage process for issues and pull requests submitted to the Nakraku Stash repository. All maintainers and contributors must follow these procedures to ensure high velocity and strict engineering quality.

---

## 1. Issue Triage Protocol

Every incoming issue must be evaluated across three independent dimensions: **Severity**, **Subsystem Domain**, and **Readiness**.

### 1.1 Severity Classification Matrix

| Severity Level | Definition | Response SLA | Action Required |
|---|---|---|---|
| **`P0-Critical`** | Process crash, blue-screen risk, unhandled panic in Win32 loop, data loss in SQLite, or security vulnerability. | **< 4 hours** | Immediate patch release branch; maintainers notified directly. |
| **`P1-High`** | Core feature failure (window coordinates restored incorrectly, tabs failing to stash, memory leak in background polling). | **< 24 hours** | Assign to active milestone; triage root cause in `docs/BUGS.md`. |
| **`P2-Medium`** | Degraded user experience, non-critical UI alignment glitch, fallback mechanism triggered unexpectedly. | **< 3 days** | Queue in next sprint or mark as `help wanted`. |
| **`P3-Low`** | Cosmetic defect, documentation typo, minor developer experience friction. | **< 7 days** | Mark as `good-first-issue` for community contributors. |

### 1.2 Subsystem Domain Labels

Assign one primary subsystem label to route issues to subject matter experts:
* `subsystem:win32` — Window enumeration (`EnumWindows`), placement, DWM, process memory telemetry.
* `subsystem:db` — SQLite migrations, repository queries, WAL corruption, backups.
* `subsystem:ws` — Loopback WebSocket server, MV3 extension communication, tab serialization.
* `subsystem:crypto` — Ed25519 offline licensing, hardware machine ID, Windows Credential Manager.
* `subsystem:frontend` — React components, custom router, 32px density tokens, command palette.
* `subsystem:packaging` — NSIS installer, WiX MSI, code signing, auto-updater manifests.
* `subsystem:ci` — GitHub Actions workflows, performance regression gate, coverage.

### 1.3 Readiness & Lifecycle Labels

* `status:triage-needed` — Initial state for un-reviewed issues.
* `status:needs-repro` — Issue lacks actionable reproduction steps or system telemetry.
* `status:reproduced` — Bug confirmed and reproducible locally.
* `status:blocked` — Blocked by external dependency or upstream Windows OS bug.
* `status:ready-to-work` — Specification locked and ready for implementation.

---

## 2. Issue Triage Work Loop

Maintainers follow this 5-step loop for each issue:
1. **Validate Completeness**: Verify Windows version, build number, and sanitized log output. If reproduction steps are vague, reply using the `needs-repro` response template and apply `status:needs-repro`.
2. **De-duplicate**: Check `docs/BUGS.md` and existing open/closed issues. If duplicate, link the canonical issue and close with `duplicate`.
3. **Classify Severity & Subsystem**: Add appropriate severity and subsystem labels.
4. **Isolate Elevation / UAC Quirks**: Check if the bug is caused by attempting to inspect elevated (Admin) processes from an unprivileged process. If so, advise running Nakraku Stash as Administrator or explain the Windows security boundary.
5. **Log in Living Documentation**: If the issue reveals an architectural edge case, record it in `docs/BUGS.md`.

---

## 3. Pull Request Review Protocol

Every pull request must pass the automated CI pipeline and manual maintainer audit before merge:

### 3.1 Review Checklist
1. **CI Status**: Verify all 5 jobs in `.github/workflows/ci.yml` pass green.
2. **Anti-Slop Compliance**: Check for conversational narrative commentary (`// Filter 1`, `{/* Titlebar */}`). Any narrative filler must be rejected.
3. **Desktop Density Parity**: Verify rows adhere strictly to 32px/36px compact heights and the Obsidian `#080A0E` palette.
4. **Safety & Strictness**:
   - TypeScript: Verify zero `any` declarations.
   - Rust: Verify zero unhandled `unwrap()` or `expect()` in OS calls.
5. **Coverage & Regressions**: Verify test coverage did not regress and `npm run perf:gate` passed.

### 3.2 Merge Strategy
* **Squash and Merge**: Always use Squash and Merge to maintain a clean, linear git history on `master`.
* Commit message must adhere to Conventional Commits: `<type>(<scope>): <summary> (#<pr_number>)`.

---

## 4. Response Templates

### Requesting Reproduction Info
```markdown
Thank you for reporting this issue! To help us diagnose and fix this effectively, could you please provide:
1. Your Windows OS build number (run `winver` in Windows Run dialog).
2. Monitor setup (resolution, scaling percentage, multi-display coordinates).
3. The sanitized log output from `%APPDATA%\com.nakraku.stash\logs\app.log`.

We have placed this issue on `status:needs-repro` until these details are provided.
```

### Explaining UAC / Elevation Boundary
```markdown
Windows security boundaries prevent standard unprivileged processes from calling `OpenProcess` or inspecting memory of processes running with elevated (Administrator) privileges.

If you need to stash and manage elevated applications (e.g., elevated Windows Terminal, Task Manager, or elevated IDEs), please run **Nakraku Stash as Administrator**.
```
