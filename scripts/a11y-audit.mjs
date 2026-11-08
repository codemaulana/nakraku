import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokensPath = path.resolve(__dirname, "../src/styles/tokens.css");

const css = fs.readFileSync(tokensPath, "utf-8");

function hexToRgb(hex) {
  const clean = hex.replace("#", "").trim();
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return { r, g, b };
}

function sRgbToLinear(c) {
  const val = c / 255;
  return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function extractTokens(cssContent) {
  const tokens = {};
  const regex = /--([a-zA-Z0-9_-]+):\s*(#[0-9a-fA-F]{6});/gu;
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    tokens[`--${match[1]}`] = match[2];
  }
  return tokens;
}

const tokens = extractTokens(css);

const BACKGROUNDS = [
  "--bg-base",
  "--bg-surface",
  "--bg-elevated",
  "--bg-hover",
];

const FOREGROUNDS = [
  { token: "--text-primary", minRatio: 4.5, type: "Normal Text" },
  { token: "--text-secondary", minRatio: 4.5, type: "Normal Text" },
  { token: "--text-disabled", minRatio: 4.5, type: "Hint / Auxiliary Text" },
  { token: "--text-mono", minRatio: 4.5, type: "Monospace Metric Text" },
  { token: "--accent-emerald", minRatio: 4.5, type: "Accent / Interactive Text" },
  { token: "--status-frozen", minRatio: 4.5, type: "Frozen Status Text" },
  { token: "--status-warning", minRatio: 4.5, type: "Warning Status Text" },
  { token: "--status-danger", minRatio: 4.5, type: "Danger Status Text" },
];

console.log("=== WCAG 2.1 AA COLOR CONTRAST AUDIT ===");
console.log(`Audited: ${BACKGROUNDS.length} Backgrounds × ${FOREGROUNDS.length} Foregrounds\n`);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

console.log(
  "Foreground".padEnd(20) +
  "Background".padEnd(16) +
  "Contrast".padEnd(12) +
  "Required".padEnd(12) +
  "Result"
);
console.log("-".repeat(70));

for (const fg of FOREGROUNDS) {
  const fgHex = tokens[fg.token];
  if (!fgHex) {
    console.error(`Token not found: ${fg.token}`);
    failedChecks++;
    continue;
  }
  const fgLum = relativeLuminance(hexToRgb(fgHex));

  for (const bgToken of BACKGROUNDS) {
    const bgHex = tokens[bgToken];
    if (!bgHex) {
      console.error(`Token not found: ${bgToken}`);
      failedChecks++;
      continue;
    }
    const bgLum = relativeLuminance(hexToRgb(bgHex));
    const ratio = contrastRatio(fgLum, bgLum);
    totalChecks++;

    const passed = ratio >= fg.minRatio;
    if (passed) {
      passedChecks++;
    } else {
      failedChecks++;
    }

    const ratioStr = `${ratio.toFixed(2)}:1`;
    const reqStr = `≥ ${fg.minRatio.toFixed(1)}:1`;
    const status = passed ? "[PASS]" : "[FAIL]";

    console.log(
      fg.token.padEnd(20) +
      bgToken.padEnd(16) +
      ratioStr.padEnd(12) +
      reqStr.padEnd(12) +
      status
    );
  }
}

console.log("-".repeat(70));
console.log(`Summary: ${passedChecks}/${totalChecks} tests passed (${failedChecks} failures).`);

if (failedChecks > 0) {
  console.error("FAIL: One or more tokens violate WCAG 2.1 AA contrast requirements.");
  process.exit(1);
} else {
  console.log("SUCCESS: 100% of tested token pairings satisfy WCAG 2.1 AA requirements!");
  process.exit(0);
}
