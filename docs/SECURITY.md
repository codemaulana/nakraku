# Nakraku Stash — Security Architecture & Threat Model

> **Document Version**: 1.0.0  
> **Status**: Verified via Phase 15 Security Audit  
> **Target Platform**: Windows 11 / Windows 10 (x64)

---

## 1. Security Philosophy & North Star
Nakraku Stash operates as a **zero-cloud, local-first utility**. It does not collect user telemetry, does not transmit application state over the internet, and does not maintain persistent remote connections. All session data, window coordinates, process lists, and settings are stored locally on the machine inside an embedded SQLite database (`%APPDATA%/Nakraku/nakraku.db`).

---

## 2. Threat Model & Boundaries

### 2.1 Untrusted Web Threat (External Websites)
* **Threat**: Malicious websites visited in the user's browser attempting to access the local WebSocket bridge or manipulate desktop sessions.
* **Mitigation**:
  1. The WebSocket server (`src-tauri/src/ws/server.rs`) binds strictly to loopback (`127.0.0.1:48123`), never `0.0.0.0`.
  2. The server inspects the HTTP `Origin` header during the handshake. Connections from untrusted web origins (`http://`, `https://`) are rejected with `403 Forbidden`. Only browser extensions (`chrome-extension://`, `moz-extension://`, `edge://`) and local development origins (`http://localhost:*`, `tauri://localhost`) are permitted.

### 2.2 Malicious Input & IPC Injection
* **Threat**: Compromised frontend WebView attempting to invoke unintended Win32 APIs or corrupt the local database.
* **Mitigation**:
  1. **Tauri v2 Permissions Allowlist**: Only explicitly declared commands in `src-tauri/capabilities/default.json` are exposed to the frontend.
  2. **Dual-Layer Validation**:
     - *Frontend*: Zod schemas (`src/lib/schemas.ts`) validate all inputs before calling `invoke()`.
     - *Backend*: Rust type signatures and boundary checks enforce constraints (e.g. maximum workspace length 50 chars, free-tier slot #4 locking, positive HWND validation).

### 2.3 Remote Code Execution via WebView
* **Threat**: XSS or script injection inside the Tauri WebView executing malicious code.
* **Mitigation**:
  1. Strict Content Security Policy (CSP) in `tauri.conf.json`:
     ```text
     default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: asset: https://asset.localhost; connect-src 'self' ipc: http://ipc.localhost ws://127.0.0.1:48123
     ```
  2. `'unsafe-eval'` is strictly prohibited in both the desktop app and the companion browser extension.

---

## 3. Cryptography & Hardware Privacy

### 3.1 Offline Ed25519 License Verification
* **Algorithm**: Pure offline asymmetric verification via `ed25519-dalek` v2.
* **Key Format**: `NAKRAKU.<PAYLOAD_B64>.<SIG_B64>`.
* **Zero Network Requests**: License validation is executed in-memory against a hardcoded master public key. The binary never phones home to an activation server.

### 3.2 Non-Reversible Machine Fingerprint (HWID)
* **Privacy Assurance**: The system reads the Windows Machine GUID from `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid`.
* **One-Way Domain Separation**: The raw GUID is immediately hashed with a domain salt:
  $$\text{HWID} = \text{SHA256}(\text{"nakraku:hwid:v1:"} \parallel \text{MachineGuid})$$
* Raw serial numbers, MAC addresses, and Windows account names are never stored or transmitted in license keys.

### 3.3 Credential Storage
* License keys are stored securely in the **Windows Credential Manager** via the `keyring` crate (`windows-native` vault).
* If the OS keyring is unavailable, an encrypted or scoped SQLite setting is used as a fallback, and credentials are completely purged upon deactivation.

---

## 4. Privacy & Data Minimization

### 4.1 PII Scrubbing in Crash Dumps & Logs
* Crash dumps (`crash-{timestamp}.log`) and rolling application logs (`app.log`) are scrubbed of user identifiers.
* Paths matching `C:\Users\<username>` are automatically replaced with `C:\Users\[REDACTED]` or `%USERPROFILE%`.

### 4.2 Opt-in Crash Reporting
* The application default for `send_anonymous_crash_reports` is `false`. Telemetry is strictly opt-in and requires explicit user consent in Settings.

---

## 5. Dependency Audit & Supply Chain Security
* **Production Dependencies**: Audited via `npm audit --omit=dev` with **0 vulnerabilities**.
* **Rust Dependencies**: Uses pinned versions in `Cargo.lock` from vetted, active crates (`tauri`, `tokio`, `rusqlite`, `ed25519-dalek`, `sha2`, `keyring`).
* **Extension Sandboxing**: The Chrome MV3 extension requests only `tabs` and `storage` permissions, with network access restricted to `ws://127.0.0.1:48123`.

---

## 6. Responsible Disclosure Policy
If you discover a security vulnerability in Nakraku Stash:
1. Do **NOT** disclose the vulnerability publicly in GitHub Issues.
2. Email full reproduction steps and advisory details to: **security@nakraku.app**.
3. The maintainers will respond within 48 hours to confirm the issue and coordinate a patch release.
