import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(filename);

const parseCssTokens = (cssContent: string): Record<string, string> => {
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/u);
  if (!rootMatch) {
    throw new Error("No :root block found in tokens.css");
  }

  const tokenLines = rootMatch[1].split("\n");
  const tokens: Record<string, string> = {};

  for (const line of tokenLines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("--")) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).replace(/;$/u, "").trim();
    tokens[key] = value;
  }

  return tokens;
};

describe("Design Tokens Snapshot & Drift Prevention", () => {
  const tokensFilePath = path.resolve(currentDir, "../src/styles/tokens.css");
  const cssContent = fs.readFileSync(tokensFilePath, "utf-8");
  const tokens = parseCssTokens(cssContent);

  it("matches design tokens snapshot baseline", () => {
    expect(tokens).toMatchSnapshot();
  });

  it("enforces obsidian dark theme color palette", () => {
    expect(tokens["--bg-base"]).toBe("#080A0E");
    expect(tokens["--bg-surface"]).toBe("#0F1319");
    expect(tokens["--bg-elevated"]).toBe("#161B22");
    expect(tokens["--bg-hover"]).toBe("#1C232E");
    expect(tokens["--accent-emerald"]).toBe("#10B981");
    expect(tokens["--border-subtle"]).toBe("#1F2633");
  });

  it("enforces high-density desktop metric invariants", () => {
    expect(tokens["--titlebar-height"]).toBe("38px");
    expect(tokens["--statusbar-height"]).toBe("24px");
    expect(tokens["--sidebar-width"]).toBe("200px");
    expect(tokens["--sidebar-collapsed-width"]).toBe("48px");
    expect(tokens["--row-height"]).toBe("32px");
    expect(tokens["--row-height-sm"]).toBe("28px");
    expect(tokens["--row-height-lg"]).toBe("36px");
  });

  it("enforces typography system invariants", () => {
    expect(tokens["--font-mono"]).toContain("JetBrains Mono");
    expect(tokens["--text-2xs"]).toBe("10px");
    expect(tokens["--text-xs"]).toBe("11px");
    expect(tokens["--text-sm"]).toBe("12px");
    expect(tokens["--text-base"]).toBe("14px");
  });

  it("enforces radius scale invariants", () => {
    expect(tokens["--radius-none"]).toBe("0");
    expect(tokens["--radius-xs"]).toBe("2px");
    expect(tokens["--radius-sm"]).toBe("4px");
    expect(tokens["--radius-full"]).toBe("9999px");
  });

  it("contains complete token dictionary without omissions", () => {
    const keys = Object.keys(tokens);
    expect(keys.length).toBeGreaterThanOrEqual(55);
  });
});
