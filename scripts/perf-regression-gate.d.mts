export interface PerfGateResult {
  passed: boolean;
  bundleSizeBytes: number;
  maxAllowedBundleBytes: number;
  benchmarkDiffMs: number;
  maxAllowedDiffMs: number;
  errors: string[];
}

export declare function runPerfRegressionGate(): PerfGateResult;
