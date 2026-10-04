# F004 - Connexion avec Discord ou Google

Un utilisateur peut se connecter à la plateforme avec son compte Discord ou son compte Google (OAuth2 / OpenID Connect). Il n'y a pas de mot de passe géré par l'application.

Données utilisateur :
- identifiant interne
- fournisseur (`DISCORD` ou `GOOGLE`)
- identifiant chez le fournisseur
- nom affiché
- email optionnel (Discord ne le fournit pas toujours)
- avatar optionnel
- date de création, date de dernière connexion

Un même couple (fournisseur, identifiant fournisseur) correspond à un seul utilisateur. Les deux fournisseurs ne sont pas fusionnés automatiquement, même si l'email est identique.

Implémenter de bout en bout :
Angular -> API Spring Boot -> PostgreSQL.

Backend :
- Spring Security avec `oauth2-client`, un client Discord et un client Google
- création de l'utilisateur à la première connexion, mise à jour du nom, de l'avatar et de la dernière connexion aux suivantes
- session côté serveur (cookie), CORS avec credentials pour le frontend Angular
- `GET /api/me` : utilisateur courant, `401` si non connecté
- `POST /api/logout` : termine la session
- les endpoints des parties (F002, F003) exigent une connexion, `401` sinon
- migration Flyway pour la table des utilisateurs, avec contrainte d'unicité (fournisseur, identifiant fournisseur)
- identifiants client (`client-id`, `client-secret`) lus depuis des variables d'environnement, jamais committés ; documenter les variables dans le README et les URL de redirection à déclarer chez Discord et Google

Frontend :
- page de connexion avec deux boutons : « Se connecter avec Discord » et « Se connecter avec Google »
- service d'authentification exposant l'utilisateur courant
- garde de route : un utilisateur non connecté est redirigé vers la page de connexion
- en-tête affichant le nom (et l'avatar) de l'utilisateur et un bouton de déconnexion
- respecter `docs/design/DESIGN.md`

Gérer :
- utilisateur non connecté
- connexion refusée ou annulée par l'utilisateur chez le fournisseur : retour sur la page de connexion avec un message clair
- fournisseur indisponible ou erreur : message d'erreur, pas de page blanche
- expiration de session : redirection vers la page de connexion

Tests (aucun appel réel à Discord ou Google, `scripts/verify.ps1` doit passer sans identifiants) :
- backend : connexion simulée pour chaque fournisseur (création puis reconnexion sans doublon), `/api/me` connecté et non connecté, accès aux parties refusé sans session, déconnexion
- frontend : service d'authentification, garde de route, page de connexion, en-tête
- adapter les tests existants des parties (F002, F003) pour qu'ils s'exécutent avec un utilisateur connecté, sans les supprimer ni les affaiblir
- e2e : parcours de connexion avec un fournisseur simulé

Hors périmètre :
- rôles et permissions
- rattacher une partie à son créateur (feature suivante)
- fusion de comptes entre fournisseurs
