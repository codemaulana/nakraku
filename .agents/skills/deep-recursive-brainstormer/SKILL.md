---
name: deep-recursive-brainstormer
description: Mandatory recursive brainstorming and deep architectural reasoning engine for complex tasks. Iterates through multi-perspective evaluation, adversarial stress-testing, and edge-case dissection until the absolute best-in-class solution is reached.
---

# Deep Recursive Brainstormer Skill

## 1. Directive & Trigger Matrix
When a task is classified as **complex, critical, or architecturally sensitive**, the agent MUST NOT immediately emit code. The agent is strictly required to execute recursive brainstorming rounds to uncover the optimal solution before writing a single line of implementation.

### Complexity Triggers
- **Win32 OS Integration**: FFI hooks, coordinate transforms, process termination/freezing, memory statistics, UAC elevation barriers.
- **IPC & Networking**: Tauri commands, serialization contracts, local WebSocket security, message replay, protocol envelopes.
- **Data Persistence**: SQLite schema migrations, indexing strategy, foreign key integrity, crash recovery (WAL mode).
- **Cryptographic & Licensing**: Ed25519 verification, hardware fingerprint stability across OS updates, tampering resistance.
- **High-Density UI & Spatial Layouts**: Multi-monitor canvas architecture in FigCraft, window minimap coordinates, virtualization.
- **State & Concurrency**: Workspace switching race conditions, async OS event streams, undo/redo session stacks.

---

## 2. The 4-Round Recursive Brainstorming Engine

```
+─────────────────────────────────────────────────────────────+
| Round 1: Problem Decomposition & Edge Case Matrix           |
| • Extract hidden constraints and failure conditions.        |
| • Map OS-level quirks, API deprecations, permission walls.  |
+──────────────────────────────┬──────────────────────────────+
                               │
                               ▼
+─────────────────────────────────────────────────────────────+
| Round 2: Multi-Architecture Comparison                      |
| • Formulate minimum 2-3 distinct implementation paths.      |
| • Score each: Latency, RAM (<35MB), Safety, Cleanliness.     |
+──────────────────────────────┬──────────────────────────────+
                               │
                               ▼
+─────────────────────────────────────────────────────────────+
| Round 3: Adversarial Self-Critique & Attack Simulation      |
| • "How does this break?" Red-team the chosen path.          |
| • Simulate crashes, 100+ windows, zero-state, multi-DPI.   |
+──────────────────────────────┬──────────────────────────────+
                               │
                               ▼
+─────────────────────────────────────────────────────────────+
| Round 4: Golden Synthesis & Technical Specification         |
| • Finalize concrete types, error variants, and flow chart.  |
| • Verify 100% adherence to Anti-Slop and Rust invariants.   |
+─────────────────────────────────────────────────────────────+
```

### Round 1: Problem Decomposition & Edge Case Matrix
1. Dissect the task into its lowest-level primitives (Win32 API handles, IPC payloads, SQL transactions).
2. Construct the **Adversarial Edge Case Matrix**:
   - Zero-state: What if 0 windows, 0 tabs, empty DB, cold launch?
   - Stress-state: What if 100+ windows, 50 tabs, dual 4K monitors with different DPI scalings (100% and 150%)?
   - Error-state: What if target process is elevated (admin)? What if exe was uninstalled? What if port 48123 is occupied?

### Round 2: Multi-Architecture Comparison
Evaluate competing approaches against Nakraku's North Star metrics:
- **Approach A (Naive / Common pattern)**: Identify why standard web/AI code fails here (e.g., polling vs event hooks, unbuffered IPC).
- **Approach B (High-Performance Native)**: Zero-copy, buffered event loop, typed Rust Result, minimal allocations.
- **Trade-Off Matrix**:
  | Criterion | Approach A | Approach B | Selected Decision |
  |---|---|---|---|
  | RAM Overhead | ... | ... | ... |
  | Stash Latency | ... | ... | ... |
  | Crash Safety | ... | ... | ... |

### Round 3: Adversarial Self-Critique (Red-Teaming)
Challenge the chosen design with aggressive skepticism:
- Does this introduce hidden race conditions between the browser extension and Tauri core?
- Can this lock the UI thread for >16ms (causing frame drops below 60 FPS)?
- Is there any hidden reliance on unwrap, panic, or unvalidated serialization?
- If any flaw is exposed, loop back and refine the architecture immediately.

### Round 4: Golden Synthesis
Formulate the definitive, locked specification:
- Exact Rust signatures (`fn ... -> Result<T, OsError>`).
- Exact TypeScript types and Zod schemas.
- Exact memory and latency bounds.
- Proceed to execution only after this golden synthesis is established.
