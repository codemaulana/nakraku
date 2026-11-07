---
name: context-memory-sync
description: Memory preservation and state tracking skill that logs task completions, architectural decisions, and active bug triage into living documentation.
---

# Context Memory Sync Skill

## 1. Purpose
In long-running development across 278 tasks, conversation context will naturally be summarized or truncated. This skill ensures that project memory, current phase pointer, completed tasks, and bug triage remain durable across sessions in the repository itself.

## 2. Living Documentation Artifacts

### 2.1 `docs/CONTEXT.md`
Tracks:
- Active Phase and Task ID pointer.
- Completed task log with timestamp and verification status.
- Architectural Decisions Records (ADRs) accepted during development.
- Environment status (Node version, Rust version, Tauri CLI version).

### 2.2 `docs/BUGS.md`
Tracks:
- Known issues, Win32 edge cases, or upstream quirks.
- Columns: `Bug ID`, `Description`, `Affected Component`, `Status (Open/In Progress/Resolved)`, `Resolution`.
- Rules: Never sweep a failure or edge case under the rug; always record it here.

## 3. Sync Protocol After Every Task
1. Check `docs/CONTEXT.md`.
2. Move active task row from "Pending" to "Completed".
3. Update "Active Task" to the next sequential task ID from `AGENTS.md`.
4. If an unexpected behavior occurred (e.g. UAC permission denied on certain Windows processes), log it in `docs/BUGS.md`.
5. Verify the files are cleanly formatted and committed.
