import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const rootDir = path.resolve(dirname, "..");

const CHECKS = [
  {
    file: "src/components/Button.tsx",
    name: "Button",
    checks: [
      { name: "Focus-visible ring", regex: /focus-visible:ring/u },
      { name: "Button element or role", regex: /<button/u },
      { name: "Disabled keyboard handling", regex: /disabled=\{disabled \|\| loading\}/u },
    ],
  },
  {
    file: "src/components/Input.tsx",
    name: "Input",
    checks: [
      { name: "Focus-within ring", regex: /focus-within:ring/u },
      { name: "Escape key listener", regex: /(?:e|event)\.key === "Escape"/u },
      { name: "Clear button keyboard support", regex: /aria-label="Clear input"/u },
    ],
  },
  {
    file: "src/components/Row.tsx",
    name: "Row",
    checks: [
      { name: "Keyboard tabIndex", regex: /isClickable \? 0 : undefined/u },
      { name: "Enter/Space onKeyDown", regex: /(?:event|e)\.key === "Enter" \|\| (?:event|e)\.key === " "/u },
      { name: "Focus-visible styling", regex: /focus-visible:ring/u },
    ],
  },
  {
    file: "src/components/Sidebar.tsx",
    name: "Sidebar",
    checks: [
      { name: "Ctrl+B toggle shortcut", regex: /(?:event|e)\.ctrlKey && (?:event|e)\.key\.toLowerCase\(\) === "b"/u },
      { name: "Button semantics for nav", regex: /<button/u },
      { name: "Focus-visible styling", regex: /focus-visible:ring/u },
    ],
  },
  {
    file: "src/components/Titlebar.tsx",
    name: "Titlebar",
    checks: [
      { name: "Window control buttons", regex: /<button/u },
      { name: "Aria labels for controls", regex: /aria-label=/u },
      { name: "Focus-visible styling", regex: /focus-visible:ring/u },
    ],
  },
  {
    file: "src/components/Modal.tsx",
    name: "Modal",
    checks: [
      { name: "Focus trap hook call", regex: /useFocusTrap/u },
      { name: "Escape dismiss handled", regex: /useEscapeDismiss/u },
      { name: "Close button aria-label", regex: /aria-label="Close dialog"/u },
    ],
  },
  {
    file: "src/hooks/useFocusTrap.ts",
    name: "useFocusTrap",
    checks: [
      { name: "Tab key trapped", regex: /(?:event|e)\.key !== "Tab"/u },
      { name: "Focus restoration", regex: /previousActiveElement\.current\.focus\(\)/u },
    ],
  },
  {
    file: "src/hooks/useAppShortcuts.ts",
    name: "useAppShortcuts",
    checks: [
      { name: "Ctrl+F search shortcut", regex: /(?:e|event)\.ctrlKey && (?:e|event)\.key\.toLowerCase\(\) === "f"/u },
      { name: "Ctrl+S stash shortcut", regex: /(?:e|event)\.ctrlKey && (?:e|event)\.key\.toLowerCase\(\) === "s"/u },
      { name: "Alt+1..4 tab navigation", regex: /(?:e|event)\.altKey && (?:e|event)\.key >= "1" && (?:e|event)\.key <= "4"/u },
      { name: "Event listener cleanup", regex: /removeEventListener\("keydown"/u },
    ],
  },
  {
    file: "src/components/ContextMenu.tsx",
    name: "ContextMenu",
    checks: [
      { name: "Arrow key navigation", regex: /(?:event|e)\.key === "ArrowDown"/u },
      { name: "Escape dismiss", regex: /(?:event|e)\.key === "Escape"/u },
      { name: "Enter activation", regex: /(?:event|e)\.key === "Enter"/u },
    ],
  },
];

const runAudit = () => {
  let passedCount = 0;
  let totalCount = 0;
  const failures = [];

  for (const component of CHECKS) {
    const fullPath = path.join(rootDir, component.file);
    if (!fs.existsSync(fullPath)) {
      failures.push({ file: component.file, check: "File existence", reason: "File not found" });
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    for (const check of component.checks) {
      totalCount++;
      if (check.regex.test(content)) {
        passedCount++;
      } else {
        failures.push({
          file: component.file,
          check: check.name,
          reason: `Pattern ${check.regex} not matched`,
        });
      }
    }
  }

  return { passedCount, totalCount, failures };
};

const printReport = (result) => {
  console.log("\n========================================================");
  console.log("       NAKRAKU STASH - KEYBOARD NAVIGATION AUDIT        ");
  console.log("========================================================");
  console.log(`Audited Components & Hooks: ${CHECKS.length}`);
  console.log(`Total Keyboard Invariants Checked: ${result.totalCount}`);
  console.log(`Passed: ${result.passedCount}/${result.totalCount}`);

  if (result.failures.length > 0) {
    console.log("\nFAILURES:");
    for (const fail of result.failures) {
      console.log(`  - [${fail.file}] ${fail.check}: ${fail.reason}`);
    }
    console.log("========================================================\n");
    process.exit(1);
  }

  console.log("\n[PASS] All components satisfy keyboard navigation contracts.");
  console.log("========================================================\n");
};

const result = runAudit();
printReport(result);
