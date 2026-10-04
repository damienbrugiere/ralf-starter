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

### F002 — tentative 1
- Backend : migration `V2__create_game.sql`, package `com.jdr.platform.game` (entité, repo, service, contrôleur `POST /api/games` → 201, DTO records avec Bean Validation), `ApiExceptionHandler` (400 avec `fieldErrors`). Tests MockMvc sur profil `test` (H2).
- Frontend : `game/` (service, page `CreateGamePage` en formulaire réactif, route `/games/new`, lien depuis l'accueil). Tests Vitest.
- E2E : `creer-partie.feature` + `steps/creer-partie.steps.ts`.
- Décisions : nom trimé, 1–100 caractères, description optionnelle (≤ 2000, vide → null). Pas de handler `Exception` générique (masquerait les 404/405).
- Piège : ajouter `RouterLink` à `HomePage` impose `provideRouter([])` dans son spec existant.
- 2026-10-05 00:09 F002 tentative 1/3 : PASS
