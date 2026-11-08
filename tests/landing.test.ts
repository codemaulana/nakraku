import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isDoNotTrackEnabled } from "../landing/main";

const rootDir = path.resolve(__dirname, "..");
const landingDir = path.join(rootDir, "landing");

describe("Phase 20 - Landing Page: Hero, Features & How It Works", () => {
  it("verifies landing page scaffold and hero section elements", () => {
    const htmlPath = path.join(landingDir, "index.html");
    expect(fs.existsSync(htmlPath)).toBe(true);

    const content = fs.readFileSync(htmlPath, "utf-8");
    expect(content).toContain("<title>Nakraku Stash");
    expect(content).toContain("Freeze Cluttered Workspaces");
    expect(content).toContain("Reclaim RAM. Restore in Milliseconds.");
    expect(content).toContain("Download Installer (.exe)");
    expect(content).toContain("145 ms");
    expect(content).toContain("stash-restore-flow.svg");
  });

  it("verifies feature grid and three-step stash cycle sections", () => {
    const htmlPath = path.join(landingDir, "index.html");
    const content = fs.readFileSync(htmlPath, "utf-8");

    expect(content).toContain("Win32 Zero-Elevation Engine");
    expect(content).toContain("Multi-Monitor Clamping");
    expect(content).toContain("Loopback Extension Bridge");
    expect(content).toContain("Offline Ed25519 Licensing");
    expect(content).toContain("Embedded SQLite WAL Mode");
    expect(content).toContain("High-Density 32px UI");
    expect(content).toContain("The Three-Step Stash Cycle");
  });
});

describe("Phase 20 - Landing Page: Pricing, Downloads & Changelog", () => {
  it("verifies pricing comparison matrix between Free and Pro tiers", () => {
    const htmlPath = path.join(landingDir, "index.html");
    const content = fs.readFileSync(htmlPath, "utf-8");

    expect(content).toContain("Free Tier");
    expect(content).toContain("$0");
    expect(content).toContain("Up to 3 active workspaces");
    expect(content).toContain("Pro Perpetual");
    expect(content).toContain("$29");
    expect(content).toContain("Unlimited workspaces");
  });

  it("verifies changelog highlights and direct download cards", () => {
    const htmlPath = path.join(landingDir, "index.html");
    const content = fs.readFileSync(htmlPath, "utf-8");

    expect(content).toContain("v0.1.0");
    expect(content).toContain("Standard Installer (NSIS)");
    expect(content).toContain("Nakraku-Stash-Setup-x64.exe");
    expect(content).toContain("Enterprise Package (MSI)");
    expect(content).toContain("Nakraku-Stash-x64.msi");
    expect(content).toContain("dist-extension.zip");
    expect(content).toContain("System Requirements");
  });
});

describe("Phase 20 - Landing Page: Styling, Analytics & JavaScript", () => {
  it("verifies Plausible privacy analytics tag in index.html", () => {
    const htmlPath = path.join(landingDir, "index.html");
    const content = fs.readFileSync(htmlPath, "utf-8");

    expect(content).toContain("https://plausible.io/js/script.js");
    expect(content).toContain("data-domain=\"nakraku.app\"");
  });

  it("verifies Obsidian CSS styling and responsive rules in style.css", () => {
    const cssPath = path.join(landingDir, "style.css");
    expect(fs.existsSync(cssPath)).toBe(true);

    const content = fs.readFileSync(cssPath, "utf-8");
    expect(content).toContain("--bg-base: #080a0e;");
    expect(content).toContain("--accent-emerald: #10b981;");
    expect(content).toContain("@media (max-width: 768px)");
  });

  it("verifies landing page JavaScript controller and DNT helper", () => {
    const jsPath = path.join(landingDir, "main.js");
    expect(fs.existsSync(jsPath)).toBe(true);
    expect(typeof isDoNotTrackEnabled).toBe("function");
    expect(typeof isDoNotTrackEnabled()).toBe("boolean");
  });
});
