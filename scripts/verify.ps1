# Barriere objective de Ralph : code de sortie 0 = feature validee.
# Chaque etape echoue explicitement sur un code de sortie non nul
# ($ErrorActionPreference ne suffit pas pour les commandes natives en PS 5.1).
param([switch]$SkipE2E)

$ErrorActionPreference = "Continue"   # les codes de sortie natifs sont verifies dans Step
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$script:ran = 0

function Step([string]$Name, [string]$Dir, [scriptblock]$Command) {
    Write-Host ""
    Write-Host ">>> $Name ($Dir)"
    Push-Location (Join-Path $root $Dir)
    $global:LASTEXITCODE = 0
    try {
        & $Command
        $code = $LASTEXITCODE
    } catch {
        Write-Host $_
        $code = 1
    } finally {
        Pop-Location
    }
    if ($code -ne 0) {
        Write-Host "VERIFY FAIL : $Name (code $code)"
        exit 1
    }
    $script:ran++
    Write-Host "OK : $Name"
}

function Has-NpmScript([string]$Dir, [string]$Name) {
    $pkg = Get-Content (Join-Path $root "$Dir/package.json") -Raw -Encoding UTF8 | ConvertFrom-Json
    return [bool]($pkg.scripts -and $pkg.scripts.PSObject.Properties[$Name])
}

function Npm-Install([string]$Dir) {
    if (-not (Test-Path (Join-Path $root "$Dir/node_modules"))) {
        Step "npm install" $Dir { if (Test-Path package-lock.json) { npm ci } else { npm install } }
    }
}

# --- Backend Spring Boot ---
$backend = "backend/springboot"
if (Test-Path "$backend/pom.xml") {
    Step "backend: tests" $backend { if (Test-Path mvnw.cmd) { .\mvnw.cmd -B test } else { mvn -B test } }
} elseif (Test-Path "$backend/build.gradle*") {
    Step "backend: tests" $backend { if (Test-Path gradlew.bat) { .\gradlew.bat test } else { gradle test } }
}

# --- Frontend Angular ---
$frontend = "frontend/angular"
if (Test-Path "$frontend/package.json") {
    Npm-Install $frontend
    if (Has-NpmScript $frontend "lint") { Step "frontend: lint" $frontend { npm run lint } }
    if (Has-NpmScript $frontend "test:ci") { Step "frontend: tests" $frontend { npm run test:ci } }
    else { Step "frontend: tests" $frontend { npm test -- --watch=false } }
    Step "frontend: build" $frontend { npm run build }
}

# --- Docker Compose (validation de la configuration) ---
$compose = Get-ChildItem "ops/compose" -Filter "*compose*.y*ml" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($compose -and (Get-Command docker -ErrorAction SilentlyContinue)) {
    Step "compose: config" "ops/compose" { docker compose -f $compose.Name config -q }
}

# --- E2E Playwright ---
if (-not $SkipE2E -and (Test-Path "e2e/package.json")) {
    Npm-Install "e2e"
    if (Has-NpmScript "e2e" "test") { Step "e2e" "e2e" { npm test } }
}

if ($script:ran -eq 0) {
    Write-Host "VERIFY FAIL : aucun projet a verifier (backend/frontend absents)."
    exit 1
}

Write-Host ""
Write-Host "VERIFY PASS ($script:ran etapes)"
exit 0
