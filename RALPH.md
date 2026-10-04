# Ralph

Une seule feature à la fois.

Maximum : 3 essais par feature (`maxAttemptsPerFeature` dans `prd.json`).

1. Sélectionner la prochaine feature (statut todo/in_progress, dépendances done, priorité).
2. Incrémenter attempts.
3. Lancer Claude Code (`claude -p`) avec `prompt.md` rempli.
4. Vérifier le projet (`scripts/verify.ps1`).
5. Si OK : done.
6. Si KO : retry, avec la fin du log d'échec transmise à la tentative suivante (`lastFailure`).
7. Après 3 échecs : blocked et arrêt global.

prd.json est la source de vérité.

## Commandes

```powershell
.\ralph.ps1 -Status            # état du backlog
.\ralph.ps1 -DryRun            # affiche la prochaine feature et le prompt, sans lancer Claude
.\ralph.ps1 -MaxIterations 1   # une seule tentative
.\ralph.ps1                    # boucle complète
.\ralph.ps1 -Reset F002        # débloquer une feature (todo, attempts = 0)
```

Options : `-Model opus|sonnet`, `-PermissionMode auto|acceptEdits|bypassPermissions` (défaut `auto`),
`-SkipE2E`, `-Commit` (commit git après chaque feature validée, si le dossier est un dépôt git).

Logs : `.ralph/logs/<feature>-attempt<n>-<horodatage>-claude.log` et `-verify.log`.
