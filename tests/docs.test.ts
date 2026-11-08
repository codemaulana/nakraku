import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "..");
const docsDir = path.resolve(rootDir, "docs");

describe("Phase 18 - Root Documentation Files", () => {
  it("verifies README.md exists and contains all required specifications", () => {
    const readmePath = path.join(rootDir, "README.md");
    expect(fs.existsSync(readmePath)).toBe(true);

    const content = fs.readFileSync(readmePath, "utf-8");
    expect(content).toContain("# Nakraku Stash");
    expect(content).toContain("System Requirements");
    expect(content).toContain("Installation");
    expect(content).toContain("Keyboard Shortcuts");
    expect(content).toContain("Architecture Overview");
    expect(content).toContain("Building from Source");
    expect(content).toContain("Testing & Quality Assurance");
    expect(content).toContain("Privacy & Security Philosophy");
    expect(content).toContain("docs/previews/stash-restore-flow.svg");
  });

  it("verifies CONTRIBUTING.md enforces all project invariants", () => {
    const contribPath = path.join(rootDir, "CONTRIBUTING.md");
    expect(fs.existsSync(contribPath)).toBe(true);

    const content = fs.readFileSync(contribPath, "utf-8");
    expect(content).toContain("Anti-Slop AI Invariant");
    expect(content).toContain("Anti-Slop UI Invariant");
    expect(content).toContain("TypeScript Strictness Invariant");
    expect(content).toContain("Rust Safety Invariant");
    expect(content).toContain("Conventional Commits");
    expect(content).toContain("npm run ci:all");
  });

  it("verifies CHANGELOG.md contains Keep a Changelog v0.1.0 release notes", () => {
    const changelogPath = path.join(rootDir, "CHANGELOG.md");
    expect(fs.existsSync(changelogPath)).toBe(true);

    const content = fs.readFileSync(changelogPath, "utf-8");
    expect(content).toContain("[0.1.0] - 2026-11-08");
    expect(content).toContain("### Added");
    expect(content).toContain("### Performance Optimizations");
    expect(content).toContain("Win32 OS Subsystem");
    expect(content).toContain("Browser Companion Extension");
  });
});

describe("Phase 18 - Technical Specs & Previews", () => {
  it("verifies docs/ARCHITECTURE.md documents all subsystems and IPC flow", () => {
    const archPath = path.join(docsDir, "ARCHITECTURE.md");
    expect(fs.existsSync(archPath)).toBe(true);

    const content = fs.readFileSync(archPath, "utf-8");
    expect(content).toContain("Nakraku Stash — System Architecture");
    expect(content).toContain("flowchart TB");
    expect(content).toContain("Native Desktop Host & WebView2 Shell");
    expect(content).toContain("Win32 OS Subsystem");
    expect(content).toContain("Data Persistence Layer");
    expect(content).toContain("Browser Extension WebSocket Bridge");
    expect(content).toContain("Offline Cryptographic Licensing");
    expect(content).toContain("Tauri IPC Message Lifecycle");
    expect(content).toContain("Process Lifecycle & Crash Recovery");
  });

  it("verifies core architectural specification documents are present and updated", () => {
    const requiredDocs = [
      "win32-api-surface.md", "ws-protocol.md", "schema.md",
      "license-spec.md", "SECURITY.md", "perf.md",
      "BUGS.md", "CI-CD.md", "DISTRIBUTION.md",
    ];

    for (const doc of requiredDocs) {
      const docPath = path.join(docsDir, doc);
      expect(fs.existsSync(docPath), `Missing documentation file: ${doc}`).toBe(true);
      const content = fs.readFileSync(docPath, "utf-8");
      expect(content.length).toBeGreaterThan(100);
    }
  });

  it("verifies demo preview asset exists in docs/previews", () => {
    const svgPath = path.join(docsDir, "previews", "stash-restore-flow.svg");
    expect(fs.existsSync(svgPath)).toBe(true);
    const content = fs.readFileSync(svgPath, "utf-8");
    expect(content).toContain("<svg");
    expect(content).toContain("NAKRAKU STASH");
  });
});

describe("Phase 18 - TypeScript API JSDoc Contracts", () => {
  it("verifies TypeScript API client modules have parameter contract JSDoc", () => {
    const filesToCheck = [
      path.join(rootDir, "src", "lib", "api.ts"),
      path.join(rootDir, "src", "lib", "osApi.ts"),
      path.join(rootDir, "src", "lib", "wsApi.ts"),
      path.join(rootDir, "src", "lib", "licenseApi.ts"),
      path.join(rootDir, "src", "lib", "loggingApi.ts"),
    ];

    for (const filePath of filesToCheck) {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("/**");
      expect(content).toContain("@returns");
    }
  });
});
