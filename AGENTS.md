# AGENTS.md

## Architecture
- frontend/angular : Angular
- backend/springboot : Spring Boot
- PostgreSQL
- e2e : tests end-to-end
- ops : infrastructure
- docs : documentation

## Règles
- Une feature doit être implémentée de bout en bout.
- Ne jamais considérer une feature terminée sans vérification automatisée.
- Ne jamais supprimer un test pour faire passer le build.
- Toute modification DB passe par une migration.
- Respecter docs/design/DESIGN.md.
