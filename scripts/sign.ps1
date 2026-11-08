param (
    [Parameter(Mandatory = $true)]
    [string]$FilePath,

    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [switch]$Strict
)

function Find-SignTool {
    $sdkPaths = @(
        "${env:ProgramFiles(x86)}\Windows Kits\10\bin\*\x64\signtool.exe",
        "${env:ProgramFiles}\Windows Kits\10\bin\*\x64\signtool.exe"
    )
    foreach ($pattern in $sdkPaths) {
        $found = Get-Item -Path $pattern -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
        if ($found -and (Test-Path $found.FullName)) {
            return $found.FullName
        }
    }
    $inPath = Get-Command signtool.exe -ErrorAction SilentlyContinue
    if ($inPath) {
        return $inPath.Source
    }
    return $null
}

if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

$signTool = Find-SignTool
$thumbprint = $env:SIGN_CERT_THUMBPRINT
$pfxFile = $env:SIGN_CERT_FILE
$pfxPassword = $env:SIGN_CERT_PASSWORD
$azureConfig = $env:AZURE_CODE_SIGNING_CONFIG

if (-not $signTool) {
    if ($Strict) {
        Write-Error "signtool.exe not found in Windows Kits or PATH."
        exit 1
    }
    Write-Host "[SIGN:SKIP] signtool.exe not found; skipping signature on: $FilePath"
    exit 0
}

$signArgs = @("sign", "/v", "/fd", "sha256", "/tr", $TimestampUrl, "/td", "sha256", "/d", "Nakraku Stash")

if ($thumbprint) {
    $signArgs += @("/sha1", $thumbprint)
} elseif ($pfxFile -and (Test-Path $pfxFile)) {
    $signArgs += @("/f", $pfxFile)
    if ($pfxPassword) {
        $signArgs += @("/p", $pfxPassword)
    }
} elseif ($azureConfig) {
    $signArgs = @("sign", "/v", "/dlib", "Azure.CodeSigning.Dlib.dll", "/dmdf", $azureConfig, $FilePath)
} else {
    if ($Strict) {
        Write-Error "No signing credentials provided (SIGN_CERT_THUMBPRINT or SIGN_CERT_FILE required)."
        exit 1
    }
    Write-Host "[SIGN:SKIP] No signing credentials provided in environment; skipping: $FilePath"
    exit 0
}

if (-not $azureConfig) {
    $signArgs += $FilePath
}

Write-Host "[SIGN:RUN] Signing $FilePath with SHA-256 and RFC 3161 timestamp..."
& $signTool $signArgs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Signing failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "[SIGN:VERIFY] Verifying signature on $FilePath..."
& $signTool verify /pa /v $FilePath
if ($LASTEXITCODE -ne 0) {
    Write-Error "Verification failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host "[SIGN:SUCCESS] Signed and verified: $FilePath"
exit 0
