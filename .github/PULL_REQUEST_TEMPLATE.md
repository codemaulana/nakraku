## Summary of Changes

<!-- Provide a concise description of the changes introduced in this PR. -->

Closes #(issue number)

---

## Type of Change

- [ ] `feat`: New feature or capability
- [ ] `fix`: Bug mitigation or fix
- [ ] `perf`: Performance enhancement or memory optimization
- [ ] `refactor`: Code cleanup without functional change
- [ ] `docs`: Documentation updates or additions
- [ ] `test`: New tests or test improvements
- [ ] `chore`: Toolchain, dependencies, or packaging updates

---

## Pre-Merge Quality & Anti-Slop Invariant Checklist

All contributors must verify that their PR complies with Nakraku Stash invariants before requesting review:

### Code Quality & Anti-Slop
- [ ] **Zero Narrative Comments**: Code is self-documenting; no `// Filter 1`, `{/* Header */}`, or AI narrative comments.
- [ ] **Function Size**: All functions are under 50 lines (verified by Oxlint).
- [ ] **File Size**: All files are under 300 lines (modular architecture).
- [ ] **TypeScript Strictness**: Zero `any`. All IPC data types are validated at runtime via Zod.
- [ ] **Rust Safety**: Zero unhandled `unwrap()` or `expect()` in Win32 OS calls or SQLite queries.
- [ ] **Desktop Density**: High-density utility metrics respected (32px/36px compact rows, 38px titlebar, Obsidian `#080A0E` palette).

### Quality Verification Battery
- [ ] `npm run lint` passes with 0 warnings and 0 errors.
- [ ] `npm run check` (`tsc --noEmit`) passes with 0 errors.
- [ ] `powershell -ExecutionPolicy Bypass -File scripts/guardrails.ps1` passes with 0 violations.
- [ ] `npm test` passes (all Vitest suites).
- [ ] `npm run test:rust` passes (all Cargo tests).
- [ ] `npm run perf:gate` passes (main bundle <200 kB, diff latency <15 ms).
- [ ] `npm run ci:all` executed locally and all checks green.

---

## Visual Verification (Screenshots / Telemetry)

<!-- If this PR alters the UI or layout, attach a screenshot demonstrating adherence to 32px high-density metrics. -->
