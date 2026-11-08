# Nakraku Stash — GitHub Repository Configuration & Maintenance Specification

This document details the canonical configuration for the `nakraku/stash` GitHub repository.

---

## 1. General Repository Metadata

* **Repository Name**: `stash`
* **Organization**: `nakraku`
* **Tagline / Description**:  
  `Ultra-compact, high-density desktop workspace & window stashing engine for Windows 10/11. Built with Tauri v2, Rust, and React 19.`
* **Homepage URL**: `https://nakraku.app`
* **Default Branch**: `master`

### Topics Taxonomy
```text
windows, tauri, rust, react, typescript, workspace-manager, window-manager, desktop-app, productivity, sqlite, open-source
```

---

## 2. Feature Toggles

| Feature | State | Rationale |
|---|---|---|
| **Issues** | **Enabled** | Primary channel for actionable bug reports and approved roadmap items. |
| **Discussions** | **Enabled** | Community forum for Q&A, setup assistance, and architectural RFCs. |
| **Projects** | **Enabled** | Milestone and roadmap tracking across phases. |
| **Wikis** | **Disabled** | All project documentation is version-controlled inside the repository `/docs` directory. |
| **Sponsorships** | **Enabled** | GitHub Sponsors integration for open-source support. |

---

## 3. Pull Request & Merge Policies

* **Allow Merge Commits**: **Disabled** (Enforces a clean linear commit graph).
* **Allow Squash Merging**: **Enabled** (Default strategy).
  * *Default Commit Title*: Pull Request Title (`PR_TITLE`).
  * *Default Commit Message*: Pull Request Body (`PR_BODY`).
* **Allow Rebase Merging**: **Enabled** (Permitted for fast-forward commits).
* **Automatically Delete Head Branches**: **Enabled** (Prunes merged feature branches immediately).

---

## 4. Branch Protection Rules on `master`

The `master` branch is protected with strict CI gating:
1. **Require a pull request before merging**:
   - Required approving reviews: `1`.
   - Dismiss stale pull request approvals when new commits are pushed: `Enabled`.
2. **Require status checks to pass before merging**:
   - Branch must be up to date before merging (`strict: true`).
   - Required check jobs:
     - `quality-and-guardrails` (Oxlint + `tsc --noEmit` + `scripts/guardrails.ps1`)
     - `test-frontend` (Vitest unit and E2E suites)
     - `test-rust` (Cargo test runner)
     - `build-check` (Vite production bundle + extension packaging)
     - `perf-regression` (`scripts/perf-regression-gate.mjs`)
3. **Require linear history**: **Enabled** (No merge bubbles).
4. **Do not allow bypassing the above settings**: **Enforced for Administrators**.
