$ErrorActionPreference = "Stop"

Write-Host "[1/2] Checking for accidentally staged secrets..."
$secretHits = git grep -nE "(AIza[0-9A-Za-z\-_]{35}|sk-[0-9A-Za-z]{20,}|ntn_[0-9A-Za-z]{20,})" 2>$null
if ($secretHits) {
    Write-Error "Potential secret detected:`n$secretHits"
    exit 1
}

Write-Host "[2/2] Running Nuxt typecheck..."
if (Test-Path ".\node_modules") {
    npx nuxi typecheck
    exit $LASTEXITCODE
} else {
    Write-Host "node_modules not installed yet. Run 'npm install' first."
    exit 0
}
