# Nakraku Stash — Offline Cryptographic Licensing Specification

> **Document Version**: 1.0.0  
> **Status**: Approved & Active  
> **Algorithm**: Ed25519 Asymmetric Digital Signature (RFC 8032)  
> **Verification Architecture**: 100% Offline, Zero-Telemetry, Zero-Network

---

## 1. Architectural Philosophy
Nakraku Stash operates under a strict privacy-first contract:
- **No License Phone-Home**: The application binary verifies cryptographic validity entirely offline.
- **Hardware Machine Lock**: Licenses are cryptographically bound to a non-reversible SHA-256 hash of the user's Windows hardware fingerprint.
- **Tamper Evidence**: Any alteration to the tier, machine ID, expiration date, or signature renders the key cryptographically invalid.

---

## 2. Canonical Payload Format
To prevent JSON whitespace and field order malleability, the signed message uses a canonical delimited UTF-8 string:

```text
nakraku:v1:<tier>:<machine_id>:<expires_at>
```

### Parameter Contracts
| Parameter | Type | Allowed Values / Constraint | Example |
|---|---|---|---|
| `version` | String | Fixed literal `v1` | `v1` |
| `tier` | String | `pro`, `lifetime`, `team` | `pro` |
| `machine_id` | String | 64-character lowercase hexadecimal string | `a3f5c98e...` |
| `expires_at` | Integer | Unix epoch timestamp in seconds (`0` indicates lifetime perpetual license) | `0` or `1799999999` |

**Canonical Example String**:
```text
nakraku:v1:pro:a3f5c98e210b42d5f0e9c8b7a6d5c4b3a2e1f0e9d8c7b6a5f4e3d2c1b0a9f8e7:0
```

---

## 3. License Key Serialization
The license key provided to the end-user is formatted with standard prefix and URL-safe Base64 segments (without padding `=`) separated by dots `.`:

```text
NAKRAKU.<BASE64URL(canonical_payload)>.<BASE64URL(ed25519_signature)>
```

1. **Segment 0**: `NAKRAKU` (brand header tag).
2. **Segment 1**: URL-safe Base64 encoded canonical payload string.
3. **Segment 2**: URL-safe Base64 encoded 64-byte Ed25519 signature.

*(Note: The parser also accepts `NAKRAKU-<payload>.<signature>` interchangeably).*

---

## 4. Verification Workflow (Rust Engine)
1. **Key Splitting**: Split license key by `.` (with legacy `NAKRAKU-` prefix normalization). Validate exactly 3 segments with prefix `NAKRAKU`.
2. **Base64URL Decoding**:
   - Decode Segment 1 into UTF-8 canonical string.
   - Decode Segment 2 into 64-byte signature slice.
3. **Canonical Payload Parsing**:
   - Split canonical string by `:`. Validate 5 parts (`nakraku`, `v1`, `<tier>`, `<machine_id>`, `<expires_at>`).
4. **Machine ID Matching**:
   - Compare payload `machine_id` with local system `machine_id`. If mismatched, return `LicenseError::MachineIdMismatch`.
5. **Expiration Checking**:
   - If `expires_at > 0`, compare with current system time in seconds (`std::time::SystemTime::now()`). If expired, return `LicenseError::Expired`.
6. **Ed25519 Cryptographic Verification**:
   - Verify 64-byte signature over canonical string UTF-8 bytes using embedded 32-byte Ed25519 public key.
   - Return `LicenseStatus { valid: true, tier: "pro", expires_at, machine_id }`.

---

## 5. Master Public Key Constant
Embedded in `src-tauri/src/license/verifier.rs`:

```rust
pub const LICENSE_PUBLIC_KEY_HEX: &str =
    "209702a69303341e793f87e0c76d77b7d1c333f28cde909b84109f47dada6493";
```

The corresponding 32-byte private key is maintained in secure serverless generator scripts ([`scripts/generate-license.mjs`](file:///c:/Nakraku/scripts/generate-license.mjs)) and never compiled into the client desktop binary.
