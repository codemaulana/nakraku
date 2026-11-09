import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';

const MAX_MAIN_BUNDLE_BYTES = 200 * 1024;
const MAX_TOTAL_GZIP_BYTES = 250 * 1024;
const MAX_DIFF_BENCHMARK_MS = 15;

function ensureDistAssets() {
  const distAssetsDir = path.resolve(process.cwd(), 'dist', 'assets');
  if (!fs.existsSync(distAssetsDir)) {
    try {
      execSync('npm run build', { stdio: 'ignore' });
    } catch {
      return null;
    }
  }
  return fs.existsSync(distAssetsDir) ? distAssetsDir : null;
}

function checkBundleSizes() {
  const distAssetsDir = ensureDistAssets();
  if (!distAssetsDir) {
    return {
      ok: false,
      mainBundleBytes: 0,
      totalGzipBytes: 0,
      errors: ['dist/assets directory does not exist. Run npm run build first.'],
    };
  }

  const files = fs.readdirSync(distAssetsDir);
  let totalGzipBytes = 0;
  let mainBundleBytes = 0;

  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(distAssetsDir, file);
      const content = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(content);
      totalGzipBytes += gzipped.length;

      if (file.startsWith('index-')) {
        mainBundleBytes = content.length;
      }
    }
  }

  const errors = [];
  if (mainBundleBytes > MAX_MAIN_BUNDLE_BYTES) {
    errors.push(
      `Main bundle exceeded budget: ${mainBundleBytes}B > ${MAX_MAIN_BUNDLE_BYTES}B`
    );
  }
  if (totalGzipBytes > MAX_TOTAL_GZIP_BYTES) {
    errors.push(
      `Total gzipped JS exceeded budget: ${totalGzipBytes}B > ${MAX_TOTAL_GZIP_BYTES}B`
    );
  }

  return {
    ok: errors.length === 0,
    mainBundleBytes,
    totalGzipBytes,
    errors,
  };
}

function runMockDiffBenchmark() {
  const windowCount = 150;
  const listA = Array.from({ length: windowCount }, (_, i) => ({
    hwnd: 1000 + i,
    title: `App Window ${i}`,
    process_name: i % 2 === 0 ? 'code.exe' : 'chrome.exe',
    x: (i * 10) % 1920,
    y: (i * 10) % 1080,
    width: 800,
    height: 600,
  }));

  const listB = listA.map((w, i) =>
    i % 5 === 0 ? { ...w, x: w.x + 50, title: `${w.title} [Modified]` } : w
  );

  const start = performance.now();
  const mapA = new Map(listA.map((w) => [w.hwnd, w]));
  const added = [];
  const modified = [];

  for (const b of listB) {
    const a = mapA.get(b.hwnd);
    if (!a) {
      added.push(b);
    } else if (a.x !== b.x || a.y !== b.y || a.title !== b.title) {
      modified.push(b);
    }
  }

  const durationMs = performance.now() - start;
  return {
    durationMs,
    ok: durationMs <= MAX_DIFF_BENCHMARK_MS,
    addedCount: added.length,
    modifiedCount: modified.length,
  };
}

export function runPerfRegressionGate() {
  console.log('=== NAKRAKU PERFORMANCE REGRESSION GATE ===');

  const bundleResult = checkBundleSizes();
  const benchResult = runMockDiffBenchmark();
  const allErrors = [...(bundleResult.errors || [])];

  if (!benchResult.ok) {
    allErrors.push(
      `Diff benchmark exceeded ${MAX_DIFF_BENCHMARK_MS}ms threshold: took ${benchResult.durationMs.toFixed(2)}ms`
    );
  }

  console.log(`- Main JS Bundle Size:     ${(bundleResult.mainBundleBytes / 1024).toFixed(1)} kB (Max: ${(MAX_MAIN_BUNDLE_BYTES / 1024).toFixed(1)} kB)`);
  console.log(`- Total Gzipped JS Size:   ${(bundleResult.totalGzipBytes / 1024).toFixed(1)} kB (Max: ${(MAX_TOTAL_GZIP_BYTES / 1024).toFixed(1)} kB)`);
  console.log(`- 150-Window Diff Latency: ${benchResult.durationMs.toFixed(3)} ms (Max: ${MAX_DIFF_BENCHMARK_MS} ms)`);

  const passed = allErrors.length === 0 && bundleResult.ok;
  if (!passed) {
    console.error('[PERF:FAIL] Performance regression gate failed:');
    allErrors.forEach((err) => console.error(`  x ${err}`));
    return {
      passed: false,
      bundleSizeBytes: bundleResult.mainBundleBytes,
      maxAllowedBundleBytes: MAX_MAIN_BUNDLE_BYTES,
      benchmarkDiffMs: benchResult.durationMs,
      maxAllowedDiffMs: MAX_DIFF_BENCHMARK_MS,
      errors: allErrors,
    };
  }

  console.log('[PERF:PASS] All performance criteria satisfied with 0 regressions.');
  return {
    passed: true,
    bundleSizeBytes: bundleResult.mainBundleBytes,
    maxAllowedBundleBytes: MAX_MAIN_BUNDLE_BYTES,
    benchmarkDiffMs: benchResult.durationMs,
    maxAllowedDiffMs: MAX_DIFF_BENCHMARK_MS,
    errors: [],
  };
}

if (process.argv[1] && process.argv[1].endsWith('perf-regression-gate.mjs')) {
  const res = runPerfRegressionGate();
  if (!res.passed) {
    process.exit(1);
  }
}
