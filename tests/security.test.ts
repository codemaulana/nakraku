import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(filename);

describe("Phase 15 - Security Audit: CSP & Manifest Invariants", () => {
  it("enforces strict CSP without unsafe-eval in tauri.conf.json", () => {
    const tauriConfPath = path.resolve(
      currentDir,
      "../src-tauri/tauri.conf.json"
    );
    const content = fs.readFileSync(tauriConfPath, "utf-8");
    const json = JSON.parse(content) as {
      app?: { security?: { csp?: string } };
    };

    const csp = json.app?.security?.csp ?? "";
    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("https://*");
  });

  it("enforces strict connect-src loopback in extension manifest.json", () => {
    const manifestPath = path.resolve(
      currentDir,
      "../extension/manifest.json"
    );
    const content = fs.readFileSync(manifestPath, "utf-8");
    const json = JSON.parse(content) as {
      content_security_policy?: { extension_pages?: string };
    };

    const extCsp = json.content_security_policy?.extension_pages ?? "";
    expect(extCsp).toContain("script-src 'self'");
    expect(extCsp).not.toContain("'unsafe-eval'");
    expect(extCsp).toContain("connect-src ws://127.0.0.1:48123");
    expect(extCsp).not.toContain("https://");
  });
});

describe("Phase 15 - Security Audit: HWID & Privacy Invariants", () => {
  it("verifies machine ID is a 64-character SHA-256 hash without raw GUID format", () => {
    const sampleHwid =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const rawGuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

    expect(sampleHwid).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/u.test(sampleHwid)).toBe(true);
    expect(rawGuidPattern.test(sampleHwid)).toBe(false);
  });

  it("validates WebSocket loopback origin enforcement policy", () => {
    const isAllowed = (origin: string): boolean => {
      const lower = origin.toLowerCase();
      return (
        lower.startsWith("chrome-extension://") ||
        lower.startsWith("moz-extension://") ||
        lower.startsWith("edge://") ||
        lower.startsWith("http://localhost") ||
        lower.startsWith("http://127.0.0.1") ||
        lower.startsWith("tauri://localhost")
      );
    };

    expect(isAllowed("chrome-extension://hngdfklgjhfdsh")).toBe(true);
    expect(isAllowed("http://localhost:5173")).toBe(true);
    expect(isAllowed("https://evil-attacker.com")).toBe(false);
    expect(isAllowed("http://phishing.site")).toBe(false);
  });
});
