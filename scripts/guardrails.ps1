[CmdletBinding()]
param(
    [string]$TargetDir = "c:\Nakraku",
    [switch]$FailOnError
)

$violations = [System.Collections.Generic.List[PSCustomObject]]::new()

$tsFiles = Get-ChildItem -Path "$TargetDir\src" -Recurse -Include "*.ts", "*.tsx" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "node_modules|dist" }

$rustFiles = Get-ChildItem -Path "$TargetDir\src-tauri\src" -Recurse -Include "*.rs" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch "target" }

$slopCommentPatterns = @(
    "//\s*(Step|Filter|Header|Initialize|Handle|Render|State|Return)\s+\d*",
    "\{\s*/\*\s*(Header|Footer|Sidebar|Content|List|Button|Section)\s*\*/\s*\}"
)

foreach ($file in ($tsFiles + $rustFiles)) {
    $lines = Get-Content -Path $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        $lineNum = $i + 1

        foreach ($pat in $slopCommentPatterns) {
            if ($lineText -match $pat) {
                $violations.Add([PSCustomObject]@{
                    File     = $file.FullName.Replace($TargetDir, "").TrimStart("\/")
                    Line     = $lineNum
                    Rule     = "Anti-Slop AI Narrative Comment"
                    Pattern  = $pat
                    Snippet  = $lineText.Trim()
                })
            }
        }
    }
}

foreach ($file in $tsFiles) {
    $lines = Get-Content -Path $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        $lineNum = $i + 1

        if ($lineText -match "(:\s*any\b|as\s+any\b|<any>)") {
            $violations.Add([PSCustomObject]@{
                File     = $file.FullName.Replace($TargetDir, "").TrimStart("\/")
                Line     = $lineNum
                Rule     = "TypeScript Strictness (No Any)"
                Pattern  = ": any / as any"
                Snippet  = $lineText.Trim()
            })
        }

        if ($lineText -match "\b(p-8|p-10|p-12|p-16|rounded-2xl|rounded-3xl)\b") {
            $violations.Add([PSCustomObject]@{
                File     = $file.FullName.Replace($TargetDir, "").TrimStart("\/")
                Line     = $lineNum
                Rule     = "Anti-Slop UI (Excessive Padding / Puffy Layout)"
                Pattern  = "p-8+ / rounded-2xl+"
                Snippet  = $lineText.Trim()
            })
        }
    }
}

foreach ($file in $rustFiles) {
    $lines = Get-Content -Path $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $lineText = $lines[$i]
        $lineNum = $i + 1

        if ($lineText -match "\.(unwrap|expect)\(") {
            $violations.Add([PSCustomObject]@{
                File     = $file.FullName.Replace($TargetDir, "").TrimStart("\/")
                Line     = $lineNum
                Rule     = "Rust Safety (No Unhandled Panic)"
                Pattern  = ".unwrap() / .expect()"
                Snippet  = $lineText.Trim()
            })
        }
    }
}

Write-Host "`n=== NAKRAKU STASH GUARDRAIL SCANNER v1 ===" -ForegroundColor Cyan
Write-Host "Scanned TS/TSX files: $($tsFiles.Count)"
Write-Host "Scanned Rust files:   $($rustFiles.Count)"

if ($violations.Count -eq 0) {
    Write-Host "`nResult: 0 Violations detected. Codebase satisfies all anti-slop invariants." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nResult: $($violations.Count) Violation(s) detected!" -ForegroundColor Red
    $violations | Format-Table -Property File, Line, Rule, Snippet -AutoSize
    exit 1
}
