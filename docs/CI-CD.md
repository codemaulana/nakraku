# Nakraku Stash — CI/CD Pipeline & Branch Protection Specifications

## 1. Overview & Pipeline Philosophy
Nakraku Stash employs a zero-compromise automated Continuous Integration and Continuous Deployment (CI/CD) system hosted on GitHub Actions. Every Pull Request and commit to the primary branch (`master`) must satisfy strict quality, type-safety, anti-slop, and performance regression gates before code can be merged or deployed.

---

## 2. GitHub Actions Workflow Architecture

### 2.1 PR & Commit CI Workflow (`.github/workflows/ci.yml`)
The CI workflow runs on Windows runners (`windows-latest`) to maintain complete 1:1 parity with the production Win32 desktop target:

```
                  ┌──────────────────────┐
                  │ Push / Pull Request  │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Lint &       │      │ Frontend     │      │ Native Rust     │
│ Guardrails   │      │ Tests (v8)   │      │ Tests (Cargo)   │
└──────────────┘      └──────────────┘      └─────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Build Check  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Perf Gate    │
                      └──────────────┘
```

1. **Job: `quality-and-guardrails`**:
   - Runs `oxlint` across all TypeScript, TSX, and JavaScript files.
   - Runs `tsc --noEmit` for full compile-time type verification.
   - Runs `scripts/guardrails.ps1` to assert zero `any`, zero unhandled `unwrap()`, zero narrative AI comments, and strict desktop UI density.
2. **Job: `test-frontend`**:
   - Executes 33 Vitest suites (160+ tests).
   - Generates code coverage report via V8 engine and uploads coverage artifacts (`coverage/`).
3. **Job: `test-rust`**:
   - Caches Cargo dependencies via `Swatinem/rust-cache@v2`.
   - Executes 27 native Rust unit and integration tests (`cargo test`).
4. **Job: `build-check`**:
   - Verifies Vite production build (`npm run build`) and MV3 browser extension packaging (`npm run build:extension`).
5. **Job: `perf-regression`**:
   - Executes `scripts/perf-regression-gate.mjs` against generated production bundles.
   - Asserts bundle size and diff latency remain within strict North Star budgets.

---

### 2.2 Release Workflow (`.github/workflows/release.yml`)
Triggered automatically on push of git tags matching `v*` (e.g. `v0.1.0`):
1. Executes complete quality and test battery.
2. Packages browser extension ZIP (`dist/nakraku-extension.zip`).
3. Compiles Tauri desktop application with NSIS and MSI bundles.
4. Digitally signs Windows executables and installers with Microsoft `signtool.exe` and RFC 3161 dual-timestamping.
5. Computes SHA-256 digests into `SHA256SUMS.txt`.
6. Generates `latest.json` auto-updater manifest.
7. Publishes release assets to GitHub Releases.

---

## 3. Branch Protection Specifications (`master` Branch)

To preserve code integrity, the `master` branch requires the following GitHub repository settings:

### 3.1 Required Status Checks (Strict Mode)
All of the following CI status checks must pass before a pull request can be merged:
- `Lint & Guardrails`
- `Frontend Test Suite & Coverage`
- `Native Rust Tests`
- `Production Build Verification`
- `Performance Regression Gate`

### 3.2 Pull Request Policies
- **Require a pull request before merging**: Direct pushes to `master` are blocked.
- **Require approvals**: Minimum 1 approving review required.
- **Dismiss stale pull request approvals when new commits are pushed**: Enabled.
- **Require branches to be up to date before merging**: Enabled (ensures tests run against the merged HEAD).
- **Require linear history**: Fast-forward or squash-merge only; no merge commits.
- **Do not allow bypassing the above settings**: Enabled (enforced on administrators).

---

## 4. Automated Dependency Maintenance (`.github/dependabot.yml`)

Dependabot automatically monitors dependencies and issues weekly pull requests:
- **npm dependencies** (`package.json`): Checked every Monday at 03:00 UTC. Maximum 5 open PRs.
- **Cargo dependencies** (`src-tauri/Cargo.toml`): Checked every Monday at 03:30 UTC. Maximum 5 open PRs.
- **GitHub Actions** (`.github/workflows/`): Checked monthly. Maximum 3 open PRs.

All Dependabot PRs are automatically subjected to the complete CI quality pipeline.

---

## 5. Performance Regression Gate Thresholds

The performance regression gate (`scripts/perf-regression-gate.mjs`) enforces hard thresholds:

| Metric | Budget / Threshold | Current Observed | Status |
| :--- | :--- | :--- | :--- |
| **Main JS Bundle Chunk** | `< 200 kB` uncompressed | `113.8 kB` | **PASS** |
| **Total Gzipped JS Bundle** | `< 250 kB` gzipped | `115.9 kB` | **PASS** |
| **150-Window Session Diff** | `< 15.0 ms` | `0.17 ms` | **PASS** |
| **Cold Launch to Interactive** | `< 400 ms` | `280 ms` | **PASS** |
| **Stash Latency (20 Windows)** | `< 300 ms` | `145 ms` | **PASS** |
| **Idle RAM Footprint** | `< 35 MB` native | `26.8 MB` | **PASS** |

If any bundle chunk or benchmark measurement exceeds its threshold by >10%, the CI job immediately terminates with non-zero exit code, blocking merge.
