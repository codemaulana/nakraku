param (
    [string]$TargetDir = "src-tauri/target/release",
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$signScript = Join-Path $scriptDir "sign.ps1"

Write-Host "=== NAKRAKU STASH RELEASE SIGNING PIPELINE ==="
Write-Host "Target directory: $TargetDir"

$candidates = @()

$exePath = Join-Path $TargetDir "nakraku-stash.exe"
if (Test-Path $exePath) {
    $candidates += $exePath
}

$dlls = Get-ChildItem -Path $TargetDir -Filter "*.dll" -ErrorAction SilentlyContinue
foreach ($dll in $dlls) {
    $candidates += $dll.FullName
}

$nsisInstallers = Get-ChildItem -Path (Join-Path $TargetDir "bundle/nsis") -Filter "*.exe" -ErrorAction SilentlyContinue
foreach ($installer in $nsisInstallers) {
    $candidates += $installer.FullName
}

$msiPackages = Get-ChildItem -Path (Join-Path $TargetDir "bundle/msi") -Filter "*.msi" -ErrorAction SilentlyContinue
foreach ($msi in $msiPackages) {
    $candidates += $msi.FullName
}

if ($candidates.Count -eq 0) {
    Write-Host "[SIGN:WARN] No release binaries found in $TargetDir."
    exit 0
}

Write-Host "Found $($candidates.Count) binary artifact(s) to sign:"
foreach ($c in $candidates) {
    Write-Host " - $c"
}

foreach ($target in $candidates) {
    $params = @{
        FilePath = $target
    }
    if ($Strict) {
        $params["Strict"] = $true
    }
    & $signScript @params
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to sign $target"
        exit $LASTEXITCODE
    }
}

Write-Host "=== RELEASE SIGNING PIPELINE COMPLETED SUCCESSFULLY ==="
exit 0
