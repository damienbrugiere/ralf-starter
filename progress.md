# Progress

Projet initialisé.

## Règles
- Maximum 3 essais par feature.
- Une feature réussie est validée automatiquement.
- Une feature bloquée arrête Ralph.

### F001 — tentative 2
- Socle déjà présent (backend, frontend, e2e Playwright-BDD, compose, doc). Seul le e2e échouait : le backend lancé par `webServer` tentait de joindre PostgreSQL (le profil `test` n'était pas appliqué avec `spring-boot:run`).
- Correctif : `e2e/playwright.config.ts` passe `DB_URL/DB_USER/DB_PASSWORD` (H2 en mode PostgreSQL) via `env` au lieu du profil `test`.
- Piège : un backend java.exe résiduel sur le port 8080 masque le problème (`reuseExistingServer`).
- 2026-10-05 00:01 F001 tentative 2/3 : PASS
