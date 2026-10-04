# Fonctions de manipulation de prd.json (a dot-sourcer : . scripts/prd.ps1)
# PowerShell pur : pas de dependance Python. Lecture/ecriture en UTF-8 sans BOM.

$script:Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Prd([string]$Path = "prd.json") {
    $raw = [IO.File]::ReadAllText((Resolve-Path $Path), $script:Utf8NoBom)
    return $raw | ConvertFrom-Json
}

function Save-Prd($Prd, [string]$Path = "prd.json") {
    $json = $Prd | ConvertTo-Json -Depth 20
    [IO.File]::WriteAllText((Join-Path (Get-Location) $Path), $json + "`n", $script:Utf8NoBom)
}

function Get-Feature($Prd, [string]$Id) {
    $f = $Prd.features | Where-Object { $_.id -eq $Id }
    if (-not $f) { throw "Feature inconnue : $Id" }
    return $f
}

# Ajoute ou remplace une propriete (PS 5.1 refuse d'affecter une propriete absente)
function Set-Prop($Obj, [string]$Name, $Value) {
    $Obj | Add-Member -NotePropertyName $Name -NotePropertyValue $Value -Force
}

# Retourne l'id de la prochaine feature executable, ou :
#   DONE    : tout est termine
#   BLOCKED:<id> : une feature est bloquee (arret global)
#   STUCK   : il reste des features mais aucune n'a ses dependances satisfaites
function Get-NextFeature($Prd) {
    $blocked = @($Prd.features | Where-Object { $_.status -eq "blocked" })
    if ($blocked.Count -gt 0) { return "BLOCKED:$($blocked[0].id)" }

    $remaining = @($Prd.features | Where-Object { $_.status -in @("todo", "in_progress") })
    if ($remaining.Count -eq 0) { return "DONE" }

    foreach ($f in ($remaining | Sort-Object { [int]$_.priority })) {
        $depsOk = $true
        foreach ($d in @($f.dependsOn)) {
            if (-not $d) { continue }
            $dep = $Prd.features | Where-Object { $_.id -eq $d }
            if (-not $dep -or $dep.status -ne "done") { $depsOk = $false; break }
        }
        if ($depsOk) { return $f.id }
    }
    return "STUCK"
}
