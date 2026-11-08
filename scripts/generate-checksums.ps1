param (
    [string]$ArtifactsDir = "src-tauri/target/release/bundle",
    [string]$OutputFile = "SHA256SUMS.txt"
)

$ErrorActionPreference = "Stop"

Write-Host "=== NAKRAKU STASH ARTIFACT CHECKSUM GENERATOR ==="
Write-Host "Scanning: $ArtifactsDir"

if (-not (Test-Path $ArtifactsDir)) {
    Write-Host "[WARN] Artifacts directory not found: $ArtifactsDir"
    exit 0
}

$extensions = @("*.exe", "*.msi", "*.zip", "*.tar.gz")
$files = Get-ChildItem -Path $ArtifactsDir -Recurse -Include $extensions | Where-Object { -not $_.PSIsContainer }

if ($files.Count -eq 0) {
    Write-Host "[WARN] No installer artifacts found to hash in $ArtifactsDir"
    exit 0
}

$lines = @()

foreach ($file in $files) {
    $hashResult = Get-FileHash -Path $file.FullName -Algorithm SHA256
    $hash = $hashResult.Hash.ToLower()
    $name = $file.Name
    $line = "$hash  $name"
    $lines += $line
    Write-Host "$line"
}

$outputPath = Join-Path (Get-Location) $OutputFile
$lines | Out-File -FilePath $outputPath -Encoding ascii -Force

Write-Host "Checksums written to: $outputPath ($($lines.Count) entries)"
exit 0
