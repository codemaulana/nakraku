param(
    [int]$Port = 47800,
    [string]$FilePath = "c:\Nakraku\NakrakuUI.figcraft"
)

$figcraftExe = "C:\Program Files\FigCraft\figcraft.exe"
$cliExe = "C:\Program Files\FigCraft\figcraft-cli.exe"

if (-not (Test-Path $figcraftExe)) {
    Write-Error "FigCraft desktop executable not found at $figcraftExe"
    exit 1
}

$activeConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($activeConnection) {
    Write-Host "FigCraft is already listening on port $Port (Process ID: $($activeConnection.OwningProcess))"
    exit 0
}

$running = Get-Process figcraft -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "Restarting FigCraft with live control port $Port..."
    Stop-Process -Id $running.Id -Force
    Start-Sleep -Seconds 1
}

Write-Host "Launching FigCraft with --control $Port on $FilePath..."
$proc = Start-Process -FilePath $figcraftExe -ArgumentList "--control $Port `"$FilePath`"" -PassThru

$ready = $false
for ($i = 0; $i -lt 10; $i++) {
    Start-Sleep -Milliseconds 500
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($conn) {
        $ready = $true
        break
    }
}

if ($ready) {
    Write-Host "FigCraft live control port is active on 127.0.0.1:$Port (Process ID: $($proc.Id))."
    exit 0
} else {
    Write-Warning "Port $Port did not open within 5 seconds. Check FigCraft window."
    exit 1
}
