# Nakraku Stash — Installer, Code Signing & Distribution Architecture

## 1. Overview & Distribution Strategy
Nakraku Stash is distributed as a standalone, native Windows 10/11 desktop utility. It provides two installation mechanisms tailored for distinct deployment environments:
1. **NSIS Installer (Recommended for Individuals)**: Non-elevated per-user installation (`currentUser`) into `%LOCALAPPDATA%\Programs\Nakraku Stash`. Requires zero UAC administrator prompts, matching the friction-free installation experience of VS Code User Installer, Discord, and Slack.
2. **WiX MSI Installer (Enterprise & Corporate)**: Standard Windows Installer package (`.msi`) equipped with a fixed upgrade code GUID. Suitable for silent deployments via Group Policy Objects (GPO), Microsoft Intune, and System Center Configuration Manager (SCCM).

---

## 2. Windows Installer Configurations

### 2.1 NSIS Configuration (`tauri.conf.json`)
The NSIS packager is configured under `bundle.windows.nsis`:
- **Install Mode**: `currentUser`. Binaries and assets are extracted to `%LOCALAPPDATA%\Programs\Nakraku Stash\`.
- **Shortcuts**: Automatically provisions Start Menu and Desktop shortcuts for the current user.
- **Language**: English (`en-US`) with `displayLanguageSelector: false` for seamless unattended installation.
- **Branding**: Obsidian dark installer graphics (`installerIcon`, `headerImage`, `sidebarImage`).
- **Uninstaller**: Registers a clean uninstaller in `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\com.nakraku.stash`. Leaves user workspace databases intact unless explicitly selected for removal.

### 2.2 WiX MSI Configuration
The MSI package is configured under `bundle.windows.wix`:
- **Upgrade Code**: `8B3D9D5E-5D2B-4E38-92FE-7389AA8C1523` (RFC 4122 UUID). Guarantees consistent in-place upgrades across patch versions without leaving orphan installations.
- **Language**: `1033` (`en-US`).
- **Silent Deployment Command**:
  ```powershell
  msiexec /i "Nakraku Stash.msi" /qn /norestart
  ```

---

## 3. Application Icon Suite
The application icon suite is generated from a single 512x512 master SVG/PNG rendered in the Obsidian emerald theme:
- `src-tauri/icons/icon.ico`: Multi-resolution Windows icon containing 16x16, 24x24, 32x32, 48x48, 64x64, and 256x256 embedded frames.
- `src-tauri/icons/icon.png`: Master 512x512 PNG.
- Windows Store / Tile assets: `Square30x30Logo.png`, `Square44x44Logo.png`, `Square71x71Logo.png`, `Square89x89Logo.png`, `Square107x107Logo.png`, `Square142x142Logo.png`, `Square150x150Logo.png`, `Square284x284Logo.png`, `Square310x310Logo.png`, and `StoreLogo.png`.

---

## 4. Windows Code Signing & Verification

### 4.1 Extended Validation (EV) vs Standard (OV) Certificates
Windows Defender SmartScreen evaluates binary trust using digital signatures and download telemetry:
- **Extended Validation (EV) Certificate**: Stored on a FIPS 140-2 Level 2 Hardware Security Module (HSM) token or cloud HSM (e.g., Azure Trusted Signing). Immediately grants high SmartScreen reputation, bypassing the "Unknown Publisher" warning on initial release.
- **Organization Validation (OV) Certificate**: Requires reputation accumulation through verified downloads over time before SmartScreen warnings dissipate.

### 4.2 Automated Signing Scripts
Nakraku Stash includes production-ready PowerShell signing utilities in `scripts/`:
- `scripts/sign.ps1`: Invokes `signtool.exe` with RFC 3161 dual-timestamping:
  ```powershell
  signtool.exe sign /v /fd sha256 /tr http://timestamp.digicert.com /td sha256 /sha1 <THUMBPRINT> <TARGET_FILE>
  ```
- `scripts/sign-release.ps1`: Batch signs `nakraku-stash.exe`, dependencies, NSIS installer, and MSI package, then executes `signtool.exe verify /pa /v` to validate signature authenticity.

### 4.3 Environment Variables for Signing
| Variable | Description |
| :--- | :--- |
| `SIGN_CERT_THUMBPRINT` | SHA-1 thumbprint of the certificate in the Windows Certificate Store (`CurrentUser\My` or `LocalMachine\My`). |
| `SIGN_CERT_FILE` | Path to a local `.pfx` certificate file (alternative to store thumbprint). |
| `SIGN_CERT_PASSWORD` | Password for the `.pfx` certificate file. |
| `AZURE_CODE_SIGNING_CONFIG` | Path to metadata JSON for Azure Trusted Signing (`Azure.CodeSigning.Dlib.dll`). |

---

## 5. Windows Defender SmartScreen Reputation Program

### 5.1 Initial Reputation Buildup
If distributing with a newly issued certificate:
1. **Microsoft Security Intelligence (WDSI) Submission**: Submit newly built release binaries to [Microsoft Security Intelligence](https://www.microsoft.com/en-us/wdsi/filesubmission) as "Software Developer" to expedite positive reputation analysis.
2. **Microsoft Partner Center Attestation**: Register the organization in the Windows Hardware Developer Program / Partner Center. Attestation signing or hardware dashboard submission guarantees instant SmartScreen clearance across all Windows machines.

---

## 6. Auto-Updater Architecture (`tauri-plugin-updater`)

### 6.1 Cryptographic Integrity & Verification
Updates are secured using Ed25519 / Minisign cryptographic signatures:
1. Release bundles are packaged and signed in GitHub Actions using the private key (`TAURI_SIGNING_PRIVATE_KEY`).
2. The public key is compiled into the Tauri runtime configuration (`plugins.updater.pubkey`).
3. Before executing an update, the native Rust backend downloads the payload into a temporary directory, validates the Ed25519 signature against the payload byte hash, and refuses execution if the signature does not match.

### 6.2 Updater Manifest (`latest.json`)
GitHub Releases serves as the update distribution server. The updater checks:
`https://github.com/nakraku/nakraku-stash/releases/latest/download/latest.json`

Manifest format:
```json
{
  "version": "0.1.0",
  "notes": "Nakraku Stash v0.1.0 release notes",
  "pub_date": "2026-11-08T06:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6...",
      "url": "https://github.com/nakraku/nakraku-stash/releases/download/v0.1.0/Nakraku.Stash_0.1.0_x64-setup.nsis.zip"
    }
  }
}
```

### 6.3 Differential Update Evaluation
- **Current Architecture**: Full-payload updates packaged as zipped NSIS installers (~10-15 MB compressed).
- **Differential Update Trade-Offs**: Byte-level differential patching (e.g. `bsdiff` or Google Courgette) reduces download size to ~1-3 MB. However, it introduces complex intermediate state dependencies and failure modes if local binaries are modified. Given Nakraku's compact Rust binary footprint (<15 MB), full atomic replacement ensures 100% update reliability with zero corruption risk. Differential patching will be revisited if binary footprint exceeds 50 MB.

---

## 7. Artifact Integrity & SHA-256 Checksums
Every build generates a canonical `SHA256SUMS.txt` via `scripts/generate-checksums.ps1`. Users and administrators can independently verify binary integrity:

```powershell
# Verify downloaded installer in PowerShell
$expected = "a3f5c... <hash>"
$actual = (Get-FileHash -Path "Nakraku.Stash_0.1.0_x64-setup.exe" -Algorithm SHA256).Hash
if ($actual -eq $expected) { Write-Host "Checksum Verified!" }
```
