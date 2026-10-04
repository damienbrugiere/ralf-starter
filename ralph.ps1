<#
.SYNOPSIS
  Boucle Ralph pilotee par Claude Code (claude -p).

.EXAMPLE
  .\ralph.ps1                       # boucle complete
  .\ralph.ps1 -MaxIterations 1      # une seule tentative
  .\ralph.ps1 -DryRun               # affiche la feature et le prompt sans lancer Claude
  .\ralph.ps1 -Status               # affiche l'etat du backlog
  .\ralph.ps1 -Reset F002           # remet une feature bloquee en todo (attempts = 0)
#>
param(
    [int]$MaxIterations = 50,
    [int]$MaxAttempts = 0,                         # 0 = valeur de prd.json (maxAttemptsPerFeature)
    [string]$Model = "",                           # ex. "opus", "sonnet" ; vide = modele par defaut
    [ValidateSet("auto", "bypassPermissions", "acceptEdits")]
    [string]$PermissionMode = "auto",
    [switch]$SkipE2E,
    [switch]$Commit,                               # commit git apres chaque feature validee
    [switch]$DryRun,
    [switch]$Status,
    [string]$Reset = "",
    [switch]$SkipPreflight,                       # ne pas verifier la presence de java/mvn/node/npm
    [string]$AgentCommand = "claude"              # commande agent (remplacable pour tester la boucle)
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
. "$PSScriptRoot/scripts/prd.ps1"

$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8      # encodage du texte envoye sur stdin de claude

$LogDir = Join-Path $PSScriptRoot ".ralph/logs"
New-Item -ItemType Directory -Force $LogDir | Out-Null

function Write-Progress-Entry([string]$Line) {
    [IO.File]::AppendAllText((Join-Path $PSScriptRoot "progress.md"), "$Line`r`n", $utf8)
}

# Execute une commande native, affiche et journalise sa sortie (stdout + stderr), retourne le code de sortie.
function Invoke-Logged([string]$Log, [scriptblock]$Command, [scriptblock]$Filter = $null) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & $Command 2>&1 | ForEach-Object {
            $line = "$_"
            if ($Filter) { $line = & $Filter $line }
            if ($null -eq $line) { return }
            Write-Host $line
            [IO.File]::AppendAllText($Log, "$line`r`n", $utf8)
        }
        return $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previous
    }
}

# Convertit une ligne du flux `claude --output-format stream-json` en texte lisible ($null = ignorer).
function Format-ClaudeEvent([string]$Line) {
    if (-not $Line.StartsWith("{")) { return $Line }
    try { $e = $Line | ConvertFrom-Json } catch { return $Line }
    $t = Get-Date -Format "HH:mm:ss"
    switch ($e.type) {
        "system" { if ($e.subtype -eq "init") { return "[$t] session demarree (modele : $($e.model))" } return $null }
        "assistant" {
            $out = @()
            foreach ($c in $e.message.content) {
                if ($c.type -eq "text" -and $c.text.Trim()) { $out += "[$t] $($c.text.Trim())" }
                elseif ($c.type -eq "tool_use") {
                    $arg = $c.input.command
                    if (-not $arg) { $arg = $c.input.file_path }
                    if (-not $arg) { $arg = $c.input.pattern }
                    if (-not $arg) { $arg = $c.input.description }
                    if ($arg -and $arg.Length -gt 140) { $arg = $arg.Substring(0, 140) + "..." }
                    $out += "[$t] > $($c.name) $arg"
                }
            }
            if ($out.Count) { return ($out -join "`n") } return $null
        }
        "result" { return "[$t] termine ($($e.subtype), $([math]::Round($e.duration_ms / 1000))s)`n$($e.result)" }
        default { return $null }
    }
}

function Get-Tail([string]$Path, [int]$Lines = 60) {
    if (-not (Test-Path $Path)) { return "" }
    return ([IO.File]::ReadAllLines($Path, $utf8) | Select-Object -Last $Lines) -join "`n"
}

function Show-Status($Prd) {
    $Prd.features | Sort-Object { [int]$_.priority } | ForEach-Object {
        $color = switch ($_.status) { "done" { "Green" } "blocked" { "Red" } "in_progress" { "Yellow" } default { "Gray" } }
        Write-Host ("{0}  {1,-12} essais={2}  {3}" -f $_.id, $_.status, $_.attempts, $_.title) -ForegroundColor $color
    }
}

$prd = Read-Prd
if ($MaxAttempts -le 0) { $MaxAttempts = if ($prd.maxAttemptsPerFeature) { [int]$prd.maxAttemptsPerFeature } else { 3 } }

if ($Status) { Show-Status $prd; exit 0 }

if ($Reset) {
    $f = Get-Feature $prd $Reset
    $f.status = "todo"; $f.attempts = 0
    $f.PSObject.Properties.Remove("lastFailure")
    Save-Prd $prd
    Write-Host "$Reset remis en todo." -ForegroundColor Green
    exit 0
}

if (-not $DryRun) {
    if (-not (Get-Command $AgentCommand -ErrorAction SilentlyContinue)) { throw "La commande '$AgentCommand' est introuvable dans le PATH." }
    # Un outil manquant fait echouer verify.ps1 a coup sur : inutile de bruler des tentatives.
    if (-not $SkipPreflight) {
        $missing = @(@("java", "node", "npm") | Where-Object { -not (Get-Command $_ -ErrorAction SilentlyContinue) })
        if (-not (Get-Command mvn -ErrorAction SilentlyContinue) -and -not (Test-Path "backend/springboot/mvnw.cmd")) { $missing += "mvn (ou mvnw.cmd)" }
        if ($missing) {
            Write-Host "Outils absents du PATH : $($missing -join ', ')" -ForegroundColor Red
            Write-Host "Installez-les (ou relancez avec -SkipPreflight)." -ForegroundColor Red
            exit 2
        }
    }
}

for ($i = 1; $i -le $MaxIterations; $i++) {
    $prd = Read-Prd
    $id = Get-NextFeature $prd

    if ($id -eq "DONE") { Write-Host "Toutes les features sont terminees." -ForegroundColor Green; exit 0 }
    if ($id -like "BLOCKED:*") {
        Write-Host "$($id.Substring(8)) est bloquee : arret de Ralph. Voir .ralph/logs/ puis '.\ralph.ps1 -Reset <id>'." -ForegroundColor Red
        exit 1
    }
    if ($id -eq "STUCK") { Write-Host "Aucune feature executable (dependances non satisfaites)." -ForegroundColor Red; exit 1 }

    $f = Get-Feature $prd $id
    if ([int]$f.attempts -ge $MaxAttempts) {
        $f.status = "blocked"; Save-Prd $prd
        Write-Host "$id BLOCKED ($($f.attempts)/$MaxAttempts essais)." -ForegroundColor Red
        exit 1
    }

    # --- Debut de tentative ---
    $attempt = [int]$f.attempts + 1
    $failure = if ($f.lastFailure) { $f.lastFailure.message } else { "Aucun" }
    $spec = if ($f.spec) { $f.spec } else { "(aucune specification)" }

    $prompt = [IO.File]::ReadAllText((Join-Path $PSScriptRoot "prompt.md"), $utf8)
    $prompt = $prompt.Replace("{{FEATURE_ID}}", $f.id).
        Replace("{{FEATURE_TITLE}}", $f.title).
        Replace("{{SPEC_PATH}}", $spec).
        Replace("{{FEATURE_JSON}}", ($f | Select-Object id, title, priority, dependsOn, spec | ConvertTo-Json -Depth 5)).
        Replace("{{ATTEMPT}}", "$attempt").
        Replace("{{MAX_ATTEMPTS}}", "$MaxAttempts").
        Replace("{{PREVIOUS_FAILURE}}", $failure)

    Write-Host ""
    Write-Host "=== [$i] Feature $id - $($f.title) - tentative $attempt/$MaxAttempts ===" -ForegroundColor Cyan

    if ($DryRun) { Write-Host $prompt; exit 0 }

    $f.attempts = $attempt
    $f.status = "in_progress"
    Save-Prd $prd

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $agentLog = Join-Path $LogDir "$id-attempt$attempt-$stamp-claude.log"
    $verifyLog = Join-Path $LogDir "$id-attempt$attempt-$stamp-verify.log"

    # --- Agent ---
    $claudeArgs = @("-p", "--permission-mode", $PermissionMode, "--output-format", "stream-json", "--verbose")
    if ($Model) { $claudeArgs += @("--model", $Model) }
    Write-Host "Claude travaille... (log : $agentLog)" -ForegroundColor DarkGray
    $agentExit = Invoke-Logged $agentLog { $prompt | & $AgentCommand @claudeArgs } { param($l) Format-ClaudeEvent $l }

    # --- Verification (barriere objective) ---
    $verifyExit = 1
    if ($agentExit -eq 0) {
        Write-Host "Verification... (log : $verifyLog)" -ForegroundColor DarkGray
        $verifyArgs = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$PSScriptRoot/scripts/verify.ps1")
        if ($SkipE2E) { $verifyArgs += "-SkipE2E" }
        $verifyExit = Invoke-Logged $verifyLog { powershell @verifyArgs }
    }

    $prd = Read-Prd
    $f = Get-Feature $prd $id
    $when = Get-Date -Format "yyyy-MM-dd HH:mm"

    if ($agentExit -eq 0 -and $verifyExit -eq 0) {
        $f.status = "done"
        $f.PSObject.Properties.Remove("lastFailure")
        Save-Prd $prd
        Write-Progress-Entry "- $when $id tentative $attempt/$MaxAttempts : PASS"
        Write-Host "$id DONE" -ForegroundColor Green
        if ($Commit -and (Test-Path (Join-Path $PSScriptRoot ".git"))) {
            git add -A
            git commit -m "feat($id): $($f.title)" -m "Valide par Ralph (tentative $attempt/$MaxAttempts)."
        }
        continue
    }

    # --- Echec : on transmet le contexte a la tentative suivante ---
    if ($agentExit -ne 0) {
        $message = "L'agent Claude a echoue (code $agentExit). Fin du log agent ($agentLog) :`n" + (Get-Tail $agentLog 40)
    } else {
        $message = "scripts/verify.ps1 a echoue (code $verifyExit). Fin du log de verification ($verifyLog) :`n" + (Get-Tail $verifyLog 80)
    }
    Set-Prop $f "lastFailure" ([pscustomobject]@{ attempt = $attempt; at = $when; message = $message })
    Write-Progress-Entry "- $when $id tentative $attempt/$MaxAttempts : FAIL (voir $([IO.Path]::GetFileName($verifyLog)))"

    if ($attempt -ge $MaxAttempts) {
        $f.status = "blocked"; Save-Prd $prd
        Write-Host "$id BLOCKED apres $MaxAttempts essais." -ForegroundColor Red
        exit 1
    }
    Save-Prd $prd
    Write-Host "$id FAIL - nouvelle tentative." -ForegroundColor Yellow
}

Write-Host "MaxIterations ($MaxIterations) atteint." -ForegroundColor Yellow
exit 1
