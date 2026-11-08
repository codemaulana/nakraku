import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "..");
const githubDir = path.join(rootDir, ".github");
const docsDir = path.join(rootDir, "docs");

describe("Phase 19 - Open Source Hygiene: Legal & Community Governance", () => {
  it("verifies MIT LICENSE file exists and has correct copyright", () => {
    const licensePath = path.join(rootDir, "LICENSE");
    expect(fs.existsSync(licensePath)).toBe(true);

    const content = fs.readFileSync(licensePath, "utf-8");
    expect(content).toContain("MIT License");
    expect(content).toContain("2026 Nakraku Contributors");
  });

  it("verifies CODE_OF_CONDUCT.md follows Contributor Covenant v2.1", () => {
    const cocPath = path.join(rootDir, "CODE_OF_CONDUCT.md");
    expect(fs.existsSync(cocPath)).toBe(true);

    const content = fs.readFileSync(cocPath, "utf-8");
    expect(content).toContain("Contributor Covenant Code of Conduct");
    expect(content).toContain("Our Pledge");
    expect(content).toContain("Our Standards");
    expect(content).toContain("Enforcement Guidelines");
  });

  it("verifies TRIAGE.md defines issue classification and severity matrix", () => {
    const triagePath = path.join(rootDir, "TRIAGE.md");
    expect(fs.existsSync(triagePath)).toBe(true);

    const content = fs.readFileSync(triagePath, "utf-8");
    expect(content).toContain("Nakraku Stash — Issue & Pull Request Triage Guide");
    expect(content).toContain("P0-Critical");
    expect(content).toContain("P1-High");
    expect(content).toContain("P2-Medium");
    expect(content).toContain("P3-Low");
    expect(content).toContain("subsystem:win32");
  });
});

describe("Phase 19 - Open Source Hygiene: Templates", () => {
  it("verifies bug report and feature request issue templates", () => {
    const bugPath = path.join(githubDir, "ISSUE_TEMPLATE", "bug_report.md");
    const featPath = path.join(githubDir, "ISSUE_TEMPLATE", "feature_request.md");
    expect(fs.existsSync(bugPath)).toBe(true);
    expect(fs.existsSync(featPath)).toBe(true);

    const bugContent = fs.readFileSync(bugPath, "utf-8");
    expect(bugContent).toContain("name: Bug Report");
    expect(bugContent).toContain("Reproduction Steps");

    const featContent = fs.readFileSync(featPath, "utf-8");
    expect(featContent).toContain("name: Feature Request");
    expect(featContent).toContain("Proposed Solution");
  });

  it("verifies PULL_REQUEST_TEMPLATE.md enforces anti-slop invariants", () => {
    const prPath = path.join(githubDir, "PULL_REQUEST_TEMPLATE.md");
    expect(fs.existsSync(prPath)).toBe(true);

    const content = fs.readFileSync(prPath, "utf-8");
    expect(content).toContain("Pre-Merge Quality & Anti-Slop Invariant Checklist");
    expect(content).toContain("Zero Narrative Comments");
    expect(content).toContain("TypeScript Strictness");
    expect(content).toContain("Rust Safety");
    expect(content).toContain("Desktop Density");
  });
});

describe("Phase 19 - Open Source Hygiene: Settings & Announcement", () => {
  it("verifies repository settings and discussion specifications", () => {
    const settingsYml = path.join(githubDir, "settings.yml");
    const settingsDoc = path.join(docsDir, "GITHUB-SETTINGS.md");
    const discussionsDoc = path.join(docsDir, "DISCUSSIONS.md");
    const discussionTpl = path.join(githubDir, "DISCUSSION_TEMPLATE", "ideas.md");

    expect(fs.existsSync(settingsYml)).toBe(true);
    expect(fs.existsSync(settingsDoc)).toBe(true);
    expect(fs.existsSync(discussionsDoc)).toBe(true);
    expect(fs.existsSync(discussionTpl)).toBe(true);
  });

  it("verifies public release announcement copy in docs/ANNOUNCEMENT.md", () => {
    const annPath = path.join(docsDir, "ANNOUNCEMENT.md");
    expect(fs.existsSync(annPath)).toBe(true);

    const content = fs.readFileSync(annPath, "utf-8");
    expect(content).toContain("Hacker News (Show HN)");
    expect(content).toContain("Reddit");
    expect(content).toContain("Twitter / X Thread");
    expect(content).toContain("Product Hunt");
  });
});
