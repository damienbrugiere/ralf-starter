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

### F003 — tentative 1
- Backend : `GET /api/games` (liste triée du plus récent au plus ancien, `findAllByOrderByCreatedAtDescIdDesc`), pas de migration nécessaire. Tests MockMvc : liste vide et ordre.
- Frontend : `GameService.list()`, page `GameListPage` (`/games`) avec états chargement / vide / erreur (+ bouton Réessayer) / liste ; lien « Voir les parties » depuis l'accueil. Tests Vitest.
- E2E : `lister-parties.feature` + `steps/lister-parties.steps.ts`.
- Piège : pas de Python sur la machine ; les variables de module des steps Playwright-BDD ne sont pas partagées entre fichiers, donc une étape « statut » propre à la feature (`l'API renvoie une liste`).
- 2026-10-05 00:13 F003 tentative 1/3 : PASS

### F004 — tentative 1
- Backend : package `com.jdr.platform.auth` (`AppUser`, `UserService.registerLogin` = upsert, `ProviderProfile` pour extraire Discord/Google, `LoginUserServices` qui enveloppe `DefaultOAuth2UserService`/`OidcUserService`, `SecurityConfig`, `MeController`). Migration `V3__create_app_user.sql` (table `app_user`, unicité provider + provider_user_id). `CorsConfig` supprimé au profit du CORS Spring Security (credentials).
- Sécurité : `/api/health` public, le reste de `/api/**` authentifié (401, pas de redirection) ; CSRF par cookie `XSRF-TOKEN` (Angular renvoie `X-XSRF-TOKEN`) ; logout = `POST /api/logout` (204) ; échec OAuth → redirection `/login?error=denied|provider`.
- Discord n'a pas de provider intégré : déclaré dans `application.properties`, URI surchargeables par env (utilisées par le e2e).
- Frontend : `auth/` (service avec signal `user`, garde `canActivateChild`, intercepteur 401 → `/login?expired=1`, page de connexion), en-tête avec nom/avatar/déconnexion. Proxy Angular et nginx relaient `/oauth2` et `/login/oauth2`.
- E2E : faux fournisseur Discord `e2e/mock-oauth/server.js` (port 9100), `workers: 1` (état partagé), helpers `e2e/support/auth.ts` ; les features existantes se connectent d'abord et les appels API passent par `page.request` + en-tête CSRF.
- Pièges : Java ne fait pas confiance au certificat intercepté pour Maven Central (PKIX) → `MAVEN_OPTS=-Djavax.net.ssl.trustStoreType=Windows-ROOT` pour télécharger les nouvelles dépendances (ensuite en cache). Tests MockMvc : `oauth2Login().oauth2User(...)` pour fixer l'attribut de nom ; `.with(csrf())` sur les POST.
- 2026-10-05 00:53 F004 tentative 1/3 : PASS
