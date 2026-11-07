---
name: anti-slop-guard
description: Automated and manual guardrails against AI code slop, narrative comments, loose typing, unhandled panics, and generic bloated SaaS UI patterns.
---

# Anti-Slop Guard Skill

## 1. Overview
Nakraku Stash is a precision, high-performance native desktop tool. It must never exhibit the traits of low-effort AI generation ("AI slop"): narrative comments, placeholders, excessive web card padding, or loose typing.

## 2. Invariants

### 2.1 Code Invariants (Zero AI Commentary)
- **Forbidden Patterns**:
  - Narrative section labels: `// Filter 1`, `// Step 2: process windows`, `// State definitions`.
  - JSX block comments: `{/* Header Section */}`, `{/* Main Content */}`, `{/* Window list */}`.
  - Trivial explanation comments: `// Return true if valid`, `// Set state to true`.
  - Stub comments: `// TODO: implement later`, `// ... rest of code`.
- **Allowed Comments**:
  - Functional JSDoc / TSDoc documenting API contracts and parameters when strictly necessary.
  - Rust `///` documentation for public crates and commands.
  - Workaround explanations citing specific external issues or OS quirks (e.g., Win32 API edge cases).

### 2.2 Typing Invariants
- **TypeScript**:
  - Zero `any`. Always use discriminated unions, explicit interfaces, or `unknown` with runtime type guards (e.g. Zod schemas).
  - All IPC parameters and return types must be fully defined in `src/types/ipc.ts` and mirrored in Rust.
- **Rust**:
  - Zero `unwrap()` or `expect()` in OS FFI calls (`windows-sys`), file I/O, or SQLite queries.
  - All operations must propagate errors via `Result<T, AppError>` using the `?` operator or explicit `match`.

### 2.3 UI & Visual Invariants (High-Density Desktop Utility)
- **Row Heights**: 32px standard row, 36px large row.
- **Titlebar**: Exactly 38px, custom frameless window with native drag region (`data-tauri-drag-region`).
- **Typography**:
  - UI labels: Compact sans-serif (`Inter`, `Segoe UI Variable Text`, 11px–13px).
  - Metrics / Telemetry / PIDs / HWNDs / Coordinates: Monospace font (`JetBrains Mono`, `Cascadia Code`).
- **Color Palette**: Obsidian industrial dark theme:
  - Base Background: `#080A0E`
  - Surface Background: `#0F1319`
  - Elevated Surface: `#161B22`
  - Subtle Border: `#1F2633`
  - Emerald Accent: `#10B981`
  - Danger / Alert: `#EF4444`
  - Text Primary: `#F3F4F6`
  - Text Secondary: `#9CA3AF`
- **Anti-Slop UI Checks**:
  - No generic rounded web cards with 24px+ padding.
  - No empty whitespace gaps designed for mobile touch screens.
  - No floating cartoonish illustrations or stock SVGs.

## 3. Automated Scanning Pattern
When reviewing or generating code, ensure files pass these regex scans:
```regex
// (Step|Filter|Header|Initialize|Handle|Render|State|Return)\s+\d*
{\/\*\s*(Header|Footer|Sidebar|Content|List|Button)\s*\*\/}
:\s*any(\[\])?\b
\.(unwrap|expect)\(
```
If any pattern matches, refactor the code to remove the violation immediately.
