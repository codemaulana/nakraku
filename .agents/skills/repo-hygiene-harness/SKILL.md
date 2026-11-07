---
name: repo-hygiene-harness
description: Quality harness, pre-commit enforcement, oxlint/oxfmt configuration, and automated PowerShell guardrails for repository health.
---

# Repo Hygiene Harness Skill

## 1. Overview
Maintains clean codebase hygiene, automated pre-commit checks, and guardrails to prevent regressions, dead code, or AI slop from entering the main branch.

## 2. Automated Quality Harness Tools
- **Linters**: `oxlint` (ultrafast, strict rules) + `tsc --noEmit` (TypeScript strict check).
- **Formatters**: `oxfmt` (fast formatting, consistent spacing).
- **Git Hooks**: `lefthook` executing pre-commit checks before any commit is finalized.
- **Custom Guardrail**: `scripts/guardrails.ps1` running regex pattern matching for code slop, `any`, and `unwrap()`.

## 3. Pre-Commit Checklist
Before any commit:
1. `npm run lint` or `npx oxlint` must exit with 0 errors.
2. `npx tsc --noEmit` must pass with 0 type errors.
3. `powershell -ExecutionPolicy Bypass -File scripts/guardrails.ps1` must exit with `0 Violations`.
4. Git commit messages must follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## 4. Guardrail Enforcement
If any violation is detected:
- The commit is blocked.
- The offending file and line number are outputted.
- The engineer/agent must fix the violation before retrying.
