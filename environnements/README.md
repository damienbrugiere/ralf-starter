# Environnements

- `.env.example` : modèle versionné, sans secret.
- `.env.local` : valeurs de développement, ignoré par git (secrets OAuth Google et Discord à renseigner).

Les noms des variables OAuth suivent la liaison native de Spring Boot
(`spring.security.oauth2.client.registration.<fournisseur>.client-id|client-secret`).
