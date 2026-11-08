import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runPerfRegressionGate } from '../scripts/perf-regression-gate.mjs';

const rootDir = process.cwd();

describe('Phase 17 - GitHub Actions CI Workflows', () => {
  it('verifies ci.yml exists with required quality jobs', () => {
    const ciPath = path.join(rootDir, '.github', 'workflows', 'ci.yml');
    expect(fs.existsSync(ciPath)).toBe(true);
    const content = fs.readFileSync(ciPath, 'utf-8');

    expect(content).toContain('quality-and-guardrails:');
    expect(content).toContain('test-frontend:');
    expect(content).toContain('test-rust:');
    expect(content).toContain('build-check:');
    expect(content).toContain('perf-regression:');
  });

  it('verifies ci.yml triggers on master branch push and pull requests', () => {
    const ciPath = path.join(rootDir, '.github', 'workflows', 'ci.yml');
    const content = fs.readFileSync(ciPath, 'utf-8');
    expect(content).toContain('branches:\n      - master');
    expect(content).toContain('pull_request:');
    expect(content).toContain('test:coverage');
    expect(content).toContain('scripts/guardrails.ps1');
  });
});

describe('Phase 17 - Dependabot & Package Configuration', () => {
  it('verifies dependabot.yml configures npm, cargo, and github-actions', () => {
    const depPath = path.join(rootDir, '.github', 'dependabot.yml');
    expect(fs.existsSync(depPath)).toBe(true);
    const content = fs.readFileSync(depPath, 'utf-8');

    expect(content).toContain('package-ecosystem: "npm"');
    expect(content).toContain('package-ecosystem: "cargo"');
    expect(content).toContain('package-ecosystem: "github-actions"');
    expect(content).toContain('open-pull-requests-limit: 5');
  });

  it('verifies package.json scripts for CI and performance gate', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.scripts['perf:gate']).toBeDefined();
    expect(pkg.scripts['ci:all']).toBeDefined();
    expect(pkg.scripts['test:coverage']).toBeDefined();
  });
});

describe('Phase 17 - Performance Regression Gate & Documentation', () => {
  it('verifies perf-regression-gate passes with 0 violations on production bundle', () => {
    const result = runPerfRegressionGate();
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.bundleSizeBytes).toBeLessThan(result.maxAllowedBundleBytes);
    expect(result.benchmarkDiffMs).toBeLessThan(result.maxAllowedDiffMs);
  });

  it('verifies docs/CI-CD.md documents branch protection and SLA budgets', () => {
    const docPath = path.join(rootDir, 'docs', 'CI-CD.md');
    expect(fs.existsSync(docPath)).toBe(true);
    const doc = fs.readFileSync(docPath, 'utf-8');

    expect(doc).toContain('Branch Protection Specifications');
    expect(doc).toContain('Performance Regression Gate Thresholds');
    expect(doc).toContain('Required Status Checks');
  });
});
