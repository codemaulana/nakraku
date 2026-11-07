param(
    [string]$TargetFile = "c:\Nakraku\NakrakuUI.figcraft",
    [string]$OutputFile = "c:\Nakraku\docs\previews\NakrakuUI_preview.png"
)

$cli = "C:\Program Files\FigCraft\figcraft-cli.exe"

if (-not (Test-Path $cli)) {
    Write-Error "FigCraft CLI not found at $cli"
    exit 1
}

$outDir = Split-Path -Parent $OutputFile
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

Write-Host "Rendering $TargetFile to $OutputFile..."
& $cli render --out $OutputFile $TargetFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Render successful: $OutputFile"
} else {
    Write-Warning "Render completed with code $LASTEXITCODE"
}
