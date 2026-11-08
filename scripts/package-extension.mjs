import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const extDir = path.resolve(rootDir, "extension");
const distDir = path.resolve(rootDir, "dist-extension");

function validateManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found at ${manifestPath}`);
  }
  const raw = fs.readFileSync(manifestPath, "utf-8");
  const manifest = JSON.parse(raw);

  if (manifest.manifest_version !== 3) {
    throw new Error(`Expected manifest_version 3, got ${manifest.manifest_version}`);
  }
  if (!manifest.name || !manifest.version) {
    throw new Error("Manifest must include name and version");
  }
  if (!manifest.background?.service_worker) {
    throw new Error("Manifest missing background service worker definition");
  }
  return manifest;
}

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function computeDirectoryStats(dir) {
  let fileCount = 0;
  let totalBytes = 0;

  function traverse(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        fileCount += 1;
        totalBytes += fs.statSync(fullPath).size;
      }
    }
  }

  traverse(dir);
  return { fileCount, totalBytes };
}

function main() {
  const manifestPath = path.join(extDir, "manifest.json");
  const manifest = validateManifest(manifestPath);

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  copyDirectoryRecursive(extDir, distDir);

  const stats = computeDirectoryStats(distDir);
  console.log(`Successfully packaged ${manifest.name} v${manifest.version}`);
  console.log(`Output: ${distDir}`);
  console.log(`Total files: ${stats.fileCount}, Size: ${stats.totalBytes} bytes`);
}

main();
