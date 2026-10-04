# Itération Ralph

Tu es lancé en mode non interactif (`claude -p`) par la boucle Ralph (`ralph.ps1`).
Personne ne répondra à tes questions : prends des décisions raisonnables et documente-les.
Tu travailles sur UNE seule feature, de bout en bout.

## Feature

{{FEATURE_ID}} — {{FEATURE_TITLE}}

Spécification : `{{SPEC_PATH}}`

```json
{{FEATURE_JSON}}
```

## Tentative

{{ATTEMPT}} / {{MAX_ATTEMPTS}}

## Échec précédent

{{PREVIOUS_FAILURE}}

Si un échec précédent est indiqué, commence par en comprendre la cause et corrige-la
plutôt que de repartir de zéro (le code de la tentative précédente est toujours là).

## Instructions

1. Lire `AGENTS.md`, `RALPH.md`, `progress.md` (apprentissages des itérations précédentes).
2. Lire la spécification `{{SPEC_PATH}}`.
3. Lire les skills pertinents dans `.agents/skills/*/SKILL.md` (angular, springboot, database, testing, design-system, ops).
4. Inspecter le code existant avant de modifier quoi que ce soit.
5. Implémenter la feature de bout en bout (Angular → API Spring Boot → PostgreSQL selon besoin).
6. Respecter `docs/design/DESIGN.md` pour tout écran.
7. Ajouter les tests nécessaires (ne jamais supprimer ni désactiver un test existant).
8. Lancer la vérification exacte utilisée par Ralph et la faire passer :
   `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify.ps1 -SkipE2E`
   (puis sans `-SkipE2E` si un projet `e2e/` existe).
9. Corriger jusqu'à ce que la vérification passe.
10. Ajouter à la fin de `progress.md` une courte section `### {{FEATURE_ID}} — tentative {{ATTEMPT}}`
    avec : ce qui a été fait, les décisions prises, les pièges rencontrés utiles aux prochaines itérations.

## Contrat avec `scripts/verify.ps1`

- Backend : `backend/springboot/pom.xml` (préférer le wrapper `mvnw.cmd`) — `test` doit passer sans service externe
  (utiliser Testcontainers seulement si Docker est disponible, sinon H2/profil de test).
- Frontend : `frontend/angular/package.json` doit exposer un script `test:ci` non interactif
  (headless, sans watch) ; `lint` est exécuté s'il existe ; `build` doit passer.
- Docker Compose : `ops/compose/*compose*.yml` doit être valide (`docker compose config`).
- E2E : `e2e/package.json` avec un script `test` autonome (Playwright `webServer` pour démarrer les apps).

## Interdits

- Ne pas modifier `prd.json` (c'est Ralph qui gère statut et tentatives).
- Ne pas modifier `ralph.ps1` ni `scripts/verify.ps1` pour faire passer la vérification.
- Ne pas travailler sur une autre feature que {{FEATURE_ID}}.
- Toute modification de schéma DB passe par une migration Flyway.

Termine par un résumé court : fichiers principaux modifiés, résultat de la vérification.
