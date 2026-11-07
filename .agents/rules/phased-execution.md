# Phased Execution Project Rule

## Directives
1. Strict one-task-at-a-time execution. Never combine multiple roadmap tasks into a single turn or pre-build future layers.
2. Follow the 278-task roadmap in `AGENTS.md` and `nakraku_full_task_breakdown.md` sequentially.
3. Every task must undergo the continuous verification loop (typecheck, tests, guardrail scans) before handoff.
4. Record completed tasks in `docs/CONTEXT.md` and known edge cases in `docs/BUGS.md`.
5. Explicitly await user verification and confirmation before advancing to the next task ID.
