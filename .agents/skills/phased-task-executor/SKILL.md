---
name: phased-task-executor
description: Step-by-step sequential task execution protocol that enforces one discrete deliverable per turn along the 288-task Nakraku Stash roadmap, integrating deep recursive brainstorming for complex tasks.
---

# Phased Task Executor Skill

## 1. Core Principle: Single-Task Isolation & Architectural Depth
Engineering a production-grade commercial desktop utility requires precision and deep thinking. Merging multiple tasks into a single turn or implementing shallow solutions degrades quality and violates user directives.

**Directives**:
1. Only execute the exact task currently active on the roadmap. Never pre-build future layers.
2. For any complex or high-risk task, invoke the `deep-recursive-brainstormer` skill before writing implementation files.

## 2. Integrated Task Lifecycle State Machine

```
[QUEUED] 
   │
   ▼
[PRE-FLIGHT] ──── Verify current task ID & prerequisites in AGENTS.md
   │
   ├── Complexity Check: Complex / High-Risk?
   │     │
   │     ├──► YES ──► [DEEP-RECURSIVE-BRAINSTORMER]
   │     │               • 4-Round recursive analysis & edge-case matrix
   │     │               • Multi-architecture trade-off comparison
   │     │               • Adversarial red-team critique
   │     │               • Golden technical specification locked
   │     ▼
   └──► [EXECUTE] ─── Write / edit files strictly for the active task
           │
           ▼
        [VERIFY] ──── Run continuous-verification-loop (typecheck, tests, guardrails)
           │               │
           │               └── If failed ──► [SELF-CORRECT] ──► Re-verify
           ▼
        [SYNC-MEMORY] Update docs/CONTEXT.md & docs/BUGS.md
           │
           ▼
        [USER-GATE] ─ Report completion, show diffs, wait for user approval
           │
           ▼
        [ADVANCE] ─── Next task becomes active only after user approves
```

## 3. Strict Execution Constraints
1. **Scope Bounding**: If Task 1.1 asks for `tokens.css`, do NOT build `Titlebar.tsx` or `Router.tsx`.
2. **Brainstorming Mandate**: Never settle for naive, surface-level code on complex OS, database, or security tasks.
3. **Deterministic Outputs**: Every file created must compile and satisfy its unit tests independently.
4. **Never Fake Progress**: Never mark a task as complete if any part was stubbed or skipped.
5. **Handoff Contract**: At the end of every task turn:
   - State clearly which task ID was completed.
   - List created or modified files.
   - Present verification command output.
   - State the exact next task ID and wait for user go-ahead.
