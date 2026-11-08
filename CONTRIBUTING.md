# Contributing to Nakraku Stash

Thank you for your interest in contributing to Nakraku Stash. We hold ourselves to uncompromising standards of code quality, performance, security, and native desktop design.

Before contributing, please read this document carefully to understand our workflows, invariants, and quality gates.

---

## 1. Core Architectural & Code Invariants

All pull requests must strictly satisfy these core invariants:

### 1.1 Anti-Slop AI Invariant (Code)
- **Zero Narrative Comments**: Do NOT add generic, pseudo-explanatory comments such as `// Filter 1`, `// Set up state`, `{/* Render Titlebar */}`, `// Initialize...`.
- Code must be self-documenting with clean, expressive identifier names and explicit TypeScript / Rust type signatures.
- **JSDoc / Rustdoc**: Parameter contracts (`@param`, `@returns`, `/// # Errors`) are encouraged for exported API boundaries. Keep them purely technical, precise, and free of narrative fluff.

### 1.2 Anti-Slop UI Invariant (Desktop Density)
- **High-Density Desktop Metrics**: Nakraku Stash is a compact desktop utility, NOT a puffy web SaaS application.
- Table and list rows must strictly adhere to **32px** (standard) or **36px** (large) height.
- Frameless titlebar must be exactly **38px** in height.
- Fonts: Monospace numbers and system metrics font (`JetBrains Mono` / `Cascadia Code`). UI font (`Inter` / system UI).
- Colors: Obsidian palette (`#080A0E` background, `#10B981` emerald accent, `#141820` surface). Never leak default Tailwind indigo/blue shades.

### 1.3 TypeScript Strictness Invariant
- **Zero `any`**: `any` is strictly prohibited throughout the entire codebase.
- Use explicit types, generics, or `unknown` narrowed with type guards or Zod schemas.
- All IPC data crossing the Tauri boundary must have a corresponding Zod schema in `src/lib/schemas.ts` and a matching Rust struct in `src-tauri/src/`.

### 1.4 Rust Safety Invariant
- **Zero Unhandled `unwrap()` or `expect()` in OS & DB Calls**: Every Win32 call, file system interaction, and SQLite query must return a typed `Result<T, AppError>`.
- Never panic in background event loops or Tauri command handlers.

### 1.5 Modular Size Constraints
- **Max 50 Lines Per Function**: Decompose complex workflows into atomic helpers and hooks.
- **Max 300 Lines Per File**: Enforce single-responsibility modularity.
- These limits are actively enforced by `oxlint`.

---

## 2. Development Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **Rust**: v1.77+ with MSVC toolchain (`x86_64-pc-windows-msvc`)
- **Visual Studio Build Tools 2022**: Desktop development with C++ workload
- **PowerShell**: Windows PowerShell 5.1 or PowerShell 7+
- **Git**: Configured with LF line endings (`git config --global core.autocrlf true` on Windows)

### Initializing Environment

```powershell
# 1. Clone repository
git clone https://github.com/nakraku/stash.git
cd stash

# 2. Install dependencies
npm install

# 3. Verify environment prerequisites
powershell -ExecutionPolicy Bypass -File scripts/check-env.ps1

# 4. Boot concurrent development environment
npm run dev
```

---

## 3. Git Workflow & Branching Strategy

### 3.1 Branch Naming Convention
Create a branch from `master` following these prefixes:
- `feat/feature-name` — New user-facing capability or system module
- `fix/bug-identifier` — Bug fix or error mitigation (e.g. `fix/bug-012-tray-status`)
- `perf/optimization-target` — Performance enhancement or memory optimization
- `docs/topic-name` — Documentation improvements or additions
- `refactor/scope` — Structural code improvements without behavioral change
- `test/test-scope` — New test suites, benchmarks, or test fixtures

### 3.2 Commit Message Standard (Conventional Commits)
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description in lowercase>
```

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Toolchain, dependency, or packaging changes

**Examples**:
- `feat(os): implement SetWinEventHook foreground window listener`
- `fix(license): normalize base64url padding during ed25519 parsing`
- `docs(api): document win32 cloaked window filtering invariants`

---

## 4. Pre-Commit Quality & Verification Protocol

Before opening a pull request, your code must pass the entire local verification battery without warnings or errors.

```powershell
# 1. Ultra-fast linter (Oxlint)
npm run lint

# 2. Strict TypeScript type check
npm run check

# 3. Anti-slop pattern scanner
powershell -ExecutionPolicy Bypass -File scripts/guardrails.ps1

# 4. Frontend Vitest suite (169 tests)
npm test

# 5. Native Rust test suite (27 tests)
npm run test:rust

# 6. Performance regression gate
npm run perf:gate

# 7. Run everything in one automated run
npm run ci:all
```

Pre-commit hooks are automatically configured via **Lefthook** (`lefthook.yml`) to enforce these checks on `git commit`. Never use `--no-verify` to bypass pre-commit gates.

---

## 5. Submitting a Pull Request

1. **Push your branch**:
   ```powershell
   git push origin feat/your-feature
   ```
2. **Open a Pull Request** against the `master` branch.
3. **Fill out the PR Template**:
   - Describe what problem is solved and why.
   - List the files changed and their responsibilities.
   - Attach terminal outputs of `npm run ci:all`.
   - If UI changes were introduced, attach before/after screenshots showing the 32px high-density layout.
4. **CI Verification**: GitHub Actions will run the automated pipeline (`quality-and-guardrails`, `test-frontend`, `test-rust`, `build-check`, `perf-regression`). All status checks must pass green before merge.
5. **Code Review**: At least one maintainer review is required. Address all feedback constructively.

---

## 6. Community & Conduct

All contributors are expected to uphold a professional, respectful, and collaborative environment. Please follow the project's Code of Conduct in all interactions.
