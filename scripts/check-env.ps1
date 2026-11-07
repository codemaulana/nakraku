[CmdletBinding()]
param()

$cargoBin = "$env:USERPROFILE\.cargo\bin"
if ((Test-Path $cargoBin) -and ($env:PATH -notlike "*$cargoBin*")) {
    $env:PATH = "$cargoBin;$env:PATH"
}

$results = [System.Collections.Generic.List[PSCustomObject]]::new()

function Test-Executable {
    param(
        [string]$Name,
        [string]$Command,
        [string]$VersionArgs,
        [string]$RequiredVersion,
        [string]$InstallGuide
    )

    $cmd = Get-Command $Command -ErrorAction SilentlyContinue
    if ($cmd) {
        try {
            $rawOutput = & $Command ($VersionArgs -split '\s+') 2>&1 | Out-String
            $firstLine = ($rawOutput.Trim() -split "`r?`n")[0]
            $results.Add([PSCustomObject]@{
                Tool       = $Name
                Installed  = $true
                Version    = $firstLine
                Required   = $RequiredVersion
                Action     = "OK"
            })
        } catch {
            $results.Add([PSCustomObject]@{
                Tool       = $Name
                Installed  = $true
                Version    = "Error reading version"
                Required   = $RequiredVersion
                Action     = "Verify executable permissions"
            })
        }
    } else {
        $results.Add([PSCustomObject]@{
            Tool       = $Name
            Installed  = $false
            Version    = "Not Found"
            Required   = $RequiredVersion
            Action     = $InstallGuide
        })
    }
}

Test-Executable -Name "Node.js" -Command "node" -VersionArgs "--version" -RequiredVersion ">= 20.0.0" -InstallGuide "Download from https://nodejs.org/"
Test-Executable -Name "npm" -Command "npm" -VersionArgs "--version" -RequiredVersion ">= 10.0.0" -InstallGuide "Comes with Node.js"
Test-Executable -Name "Rust (rustc)" -Command "rustc" -VersionArgs "--version" -RequiredVersion ">= 1.77.2" -InstallGuide "Run winget install Rustlang.Rustup or download https://rustup.rs"
Test-Executable -Name "Cargo" -Command "cargo" -VersionArgs "--version" -RequiredVersion ">= 1.77.2" -InstallGuide "Installed automatically with Rustup"
Test-Executable -Name "Tauri CLI" -Command "cargo-tauri" -VersionArgs "--version" -RequiredVersion "^2.0.0" -InstallGuide "cargo install tauri-cli --version ^2.0.0"

$figcraftPath = "C:\Program Files\FigCraft\figcraft-cli.exe"
if (Test-Path $figcraftPath) {
    $fcVer = (& $figcraftPath --version 2>&1 | Out-String).Trim()
    $results.Add([PSCustomObject]@{
        Tool       = "FigCraft CLI"
        Installed  = $true
        Version    = ($fcVer -split "`r?`n")[0]
        Required   = "Any"
        Action     = "OK"
    })
} else {
    $results.Add([PSCustomObject]@{
        Tool       = "FigCraft CLI"
        Installed  = $false
        Version    = "Not Found"
        Required   = "Recommended"
        Action     = "Install FigCraft from https://figcraft.net"
    })
}

$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $vsInstall = & $vswhere -latest -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath 2>&1
    if ($vsInstall) {
        $results.Add([PSCustomObject]@{
            Tool       = "MSVC C++ Build Tools"
            Installed  = $true
            Version    = (Split-Path -Leaf $vsInstall)
            Required   = "Visual Studio 2022 C++ Tools"
            Action     = "OK"
        })
    } else {
        $results.Add([PSCustomObject]@{
            Tool       = "MSVC C++ Build Tools"
            Installed  = $false
            Version    = "Missing VC.Tools"
            Required   = "Visual Studio 2022 C++ Tools"
            Action     = "Install Desktop development with C++ via Visual Studio Installer"
        })
    }
} else {
    $results.Add([PSCustomObject]@{
        Tool       = "MSVC C++ Build Tools"
        Installed  = $false
        Version    = "vswhere not found"
        Required   = "Visual Studio 2022 C++ Tools"
        Action     = "Download Visual Studio Build Tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/"
    })
}

$wv2Paths = @(
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-992A-44A6-9E3D-4E38DF677DC2}",
    "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-992A-44A6-9E3D-4E38DF677DC2}",
    "HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-992A-44A6-9E3D-4E38DF677DC2}"
)

$wv2Found = $false
$wv2Ver = ""

foreach ($key in $wv2Paths) {
    if (Test-Path $key) {
        $val = (Get-ItemProperty -Path $key -Name "pv" -ErrorAction SilentlyContinue).pv
        if (-not [string]::IsNullOrEmpty($val) -and $val -ne "0.0.0.0") {
            $wv2Found = $true
            $wv2Ver = $val
            break
        }
    }
}

if ($wv2Found) {
    $results.Add([PSCustomObject]@{
        Tool       = "WebView2 Runtime"
        Installed  = $true
        Version    = $wv2Ver
        Required   = ">= 100.0"
        Action     = "OK"
    })
} else {
    $edgeExe = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path $edgeExe) {
        $edgeVer = (Get-Item $edgeExe).VersionInfo.ProductVersion
        $results.Add([PSCustomObject]@{
            Tool       = "WebView2 (Edge Fallback)"
            Installed  = $true
            Version    = $edgeVer
            Required   = ">= 100.0"
            Action     = "OK (via Microsoft Edge)"
        })
    } else {
        $results.Add([PSCustomObject]@{
            Tool       = "WebView2 Runtime"
            Installed  = $false
            Version    = "Not Found"
            Required   = "Standard on Win 10/11"
            Action     = "Install Evergreen WebView2 Runtime from https://go.microsoft.com/fwlink/p/?LinkId=2124703"
        })
    }
}

Write-Host "`n=== NAKRAKU STASH TOOLCHAIN AUDIT ===" -ForegroundColor Cyan
$results | Format-Table -Property Tool, Installed, Version, Required, Action -AutoSize

$missingCritical = $results | Where-Object { -not $_.Installed -and $_.Tool -in @("Node.js", "npm") }
$missingRust = $results | Where-Object { -not $_.Installed -and $_.Tool -in @("Rust (rustc)", "Cargo") }

if ($missingCritical.Count -gt 0) {
    Write-Host "`nCRITICAL ERROR: Node.js/npm missing. Frontend development blocked." -ForegroundColor Red
    exit 1
}

if ($missingRust.Count -gt 0) {
    Write-Host "`nNOTE: Rust toolchain not detected. Frontend & FigCraft UI design can proceed immediately; Rust is required for Task 0.3+." -ForegroundColor Yellow
}

Write-Host "`nEnvironment audit completed." -ForegroundColor Green
exit 0
