---
name: continuous-verification-loop
description: Repetitive verification and self-correction loop that iteratively checks tasks against architectural depth, quality gates, and anti-slop rules until zero errors remain.
---

# Continuous Verification Loop Skill

## 1. Objective
Ensure that no task is marked complete or handed off to the user until it has passed all architectural criteria, automated quality gates, structural checks, and anti-slop scans. The agent must loop through verification and self-correction repeatedly until zero errors or violations remain.

## 2. Core Rule: Do Not Stop Early
- Never declare work complete based on assumption or initial code generation alone.
- If a verification step fails, immediately inspect the failure, determine the root cause, apply the fix, and re-run the verification step.
- Verify against the golden technical specification established by `deep-recursive-brainstormer`.
- Continue this cycle until the deliverable satisfies all acceptance criteria with 0 violations.

## 3. The 7-Step Verification Protocol

```
+───────────────────+
| 1. Architectural  |
|    Fidelity Check | ◄── Verified against deep-recursive-brainstormer spec
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 2. Deliverable    |
|    Completeness   |
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 3. Static Type &  | ──► Error? ──► [Auto-Fix] ──► Re-check
|    Syntax Check   |
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 4. Anti-Slop Scan | ──► Violation? ──► [Remove Slop] ──► Re-check
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 5. Test & Run     | ──► Failure? ──► [Debug & Patch] ──► Re-check
|    Validation     |
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 6. Memory Sync    | ──► Update docs/CONTEXT.md & docs/BUGS.md
+─────────┬─────────+
          │
          ▼
+───────────────────+
| 7. User Gate      | ──► Present exact status, wait for user confirmation
+───────────────────+
```

### Step 1: Architectural Fidelity Check
- Confirm that the implementation satisfies all edge cases identified in the brainstorming phase (e.g., zero windows, admin UAC, multi-DPI, process crash recovery).
- Confirm zero unhandled panics, zero unvalidated IPC payloads, and correct memory bounds (<35MB).

### Step 2: Deliverable Completeness Check
- Check against the active task description in `AGENTS.md` and `nakraku_full_task_breakdown.md`.
- Verify every file specified in the deliverable exists and has complete, non-stubbed contents.
- Ensure no placeholder text (e.g. `// TODO`, `/* Implement later */`, `...`) is left behind.

### Step 3: Static Type & Syntax Verification
- For TypeScript / React: run `npx tsc --noEmit` and `npm run build`.
- For Rust: run `cargo check` / `cargo clippy`.
- Any compile error, missing import, or type mismatch must be fixed before proceeding.

### Step 4: Anti-Slop AI & UI Scan
- Execute the anti-slop inspection regex:
  - No narrative commentary: `// Filter 1`, `{/* Header */}`, `// Step 2`, `// Return result`.
  - No TypeScript `any`.
  - No Rust OS/DB `unwrap()` or `expect()`.
  - No giant padded cards; rows must be 32px–36px with monospace metrics.
- If any pattern matches, clean up the offending lines immediately and re-scan.

### Step 5: Test & Execution Validation
- Run unit tests or verification scripts associated with the task (e.g. `scripts/check-env.ps1`, `scripts/guardrails.ps1`, `npm test`, `cargo test`).
- Assert expected exit code is 0.

### Step 6: Memory Sync
- Record the task completion in `docs/CONTEXT.md`.
- If an unresolvable edge case or limitation is found, document it in `docs/BUGS.md`.

### Step 7: User Gate
- Present the verified output and summary to the user.
- Explicitly ask for confirmation before progressing to the next task ID.
