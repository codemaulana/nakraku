# Anti-Slop Project Rule

## Directives
1. Zero narrative AI comments (`// Filter 1`, `{/* Header */}`, `// Initialize state`, etc.). Code must be self-documenting.
2. Zero TypeScript `any`. Always use explicit types, discriminated unions, or runtime validation.
3. Zero unhandled `unwrap()` or `expect()` in Rust OS FFI or database operations.
4. UI must strictly adhere to high-density desktop utility standards: 32px–36px compact rows, 38px titlebar, monospace metrics, Obsidian palette.
5. All code must pass automated guardrail pattern scans before being accepted.
