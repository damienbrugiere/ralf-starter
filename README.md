# JDR Platform

Projet de plateforme de jeu de rôle.

Stack :
- Angular
- Spring Boot
- PostgreSQL
- Docker
- Playwright
- Claude Code (claude -p)
- Ralph

# Exécution des features avec Ralph

Ce document explique comment Ralph sélectionne, exécute et valide les features du projet JDR.

---

## 1. Vue d'ensemble

Ralph fonctionne comme une boucle :

```text
                 +---------------------+
                 ¦      prd.json       ¦
                 ¦   Liste des tâches  ¦
                 +---------------------+
                            ¦
                            ?
                 +---------------------+
                 ¦ Sélection feature   ¦
                 ¦     suivante        ¦
                 +---------------------+
                            ¦
                            ?
                 +---------------------+
                 ¦   Lancer l'agent    ¦
                 ¦      Claude Code    ¦
                 +---------------------+
                            ¦
                            ?
                 +---------------------+
                 ¦ Implémentation      ¦
                 ¦ de la feature       ¦
                 +---------------------+
                            ¦
                            ?
                 +---------------------+
                 ¦     Vérification    ¦
                 ¦ tests / build / E2E ¦
                 +---------------------+
                            ¦
                   +-----------------+
                   ¦                 ¦
                 PASS              FAIL
                   ¦                 ¦
                   ?                 ?
                 DONE             RETRY
                                     ¦
                              attempts < 3 ?
                                ¦         ¦
                               oui       non
                                ¦         ¦
                                ?         ?
                              RETRY    BLOCKED
                                         ¦
                                         ?
                                        STOP
```

L'idée importante est :

> **L'agent propose une implémentation, mais ce sont les vérifications automatisées qui décident si la feature est réellement terminée.**

---

# 2. Le backlog : `prd.json`

`prd.json` est la source de vérité de Ralph.

Exemple :

```json
{
  "project": "jdr-platform",
  "maxAttemptsPerFeature": 3,
  "features": [
    {
      "id": "F001",
      "title": "Initialiser le projet",
      "priority": 1,
      "status": "todo",
      "attempts": 0,
      "dependsOn": []
    },
    {
      "id": "F002",
      "title": "Créer une partie",
      "priority": 2,
      "status": "todo",
      "attempts": 0,
      "dependsOn": ["F001"]
    }
  ]
}
```

Chaque feature possède notamment :

| Champ       | Rôle                                |
| ----------- | ----------------------------------- |
| `id`        | Identifiant unique                  |
| `title`     | Nom de la feature                   |
| `priority`  | Ordre de priorité                   |
| `status`    | État actuel                         |
| `attempts`  | Nombre d'essais                     |
| `dependsOn` | Features nécessaires avant celle-ci |
| `spec`      | Specification détaillée             |

---

# 3. Les états d'une feature

Une feature peut avoir plusieurs états :

```text
todo
  ¦
  ?
in_progress
  ¦
  +---- PASS ----? done
  ¦
  +---- FAIL
          ¦
          +-- attempts < 3 --? in_progress
          ¦
          +-- attempts = 3 -? blocked
```

## `todo`

La feature n'a pas encore été commencée.

```json
{
  "status": "todo",
  "attempts": 0
}
```

---

## `in_progress`

Ralph est en train de travailler dessus ou la feature doit être retentée.

```json
{
  "status": "in_progress",
  "attempts": 2
}
```

---

## `done`

La feature est terminée et les vérifications automatisées sont passées.

```json
{
  "status": "done",
  "attempts": 2
}
```

---

## `blocked`

La feature a échoué 3 fois.

```json
{
  "status": "blocked",
  "attempts": 3
}
```

Dans ce cas, Ralph s'arrête.

Il ne passe **pas** automatiquement à la feature suivante.

---

# 4. Les dépendances entre features

Une feature peut dépendre d'une autre.

Exemple :

```json
{
  "id": "F002",
  "title": "Créer une partie",
  "dependsOn": ["F001"]
}
```

Cela signifie :

```text
F001 Initialiser le projet
        ¦
        ?
F002 Créer une partie
        ¦
        ?
F003 Lister les parties
```

Tant que `F001` n'est pas `done`, Ralph ne lancera pas `F002`.

Cela évite par exemple de demander à l'agent de créer une fonctionnalité métier alors que le projet Angular/Spring Boot n'existe pas encore.

---

# 5. Sélection de la prochaine feature

Le script :

```text
scripts/prd.ps1 (Get-NextFeature)
```

cherche la prochaine feature exécutable.

Il regarde :

1. le statut ;
2. les dépendances ;
3. la priorité.

Par exemple :

```text
F001 ? done
F002 ? todo, dépend de F001
F003 ? todo, dépend de F002
```

Ralph sélectionne :

```text
F002
```

Après réussite :

```text
F001 ? done
F002 ? done
F003 ? todo
```

Il sélectionne alors :

```text
F003
```

---

# 6. Une exécution de feature

Supposons que Ralph sélectionne :

```text
F002 — Créer une partie
```

Il va commencer une tentative.

Avant :

```json
{
  "id": "F002",
  "status": "todo",
  "attempts": 0
}
```

Ralph passe à :

```json
{
  "id": "F002",
  "status": "in_progress",
  "attempts": 1
}
```

Puis il prépare le prompt envoyé à Claude Code.

---

# 7. Le rôle de `prompt.md`

`prompt.md` contient les instructions générales données à l'agent.

Il reçoit dynamiquement :

```text
Feature :
F002 — Créer une partie

Tentative :
1 / 3

Échec précédent :
Aucun
```

L'agent reçoit également la specification :

```text
docs/features/F002-creer-partie.md
```

Il doit alors :

1. lire `AGENTS.md` ;
2. lire `RALPH.md` ;
3. lire la specification ;
4. inspecter le projet ;
5. implémenter la feature ;
6. écrire les tests ;
7. lancer les vérifications ;
8. corriger les problèmes.

---

# 8. Une feature est une tranche verticale

Une feature ne doit pas être découpée artificiellement par technologie.

Par exemple :

```text
F002 — Créer une partie
```

doit potentiellement toucher :

```text
Angular
   ¦
   ?
API REST
   ¦
   ?
Spring Boot
   ¦
   ?
Service
   ¦
   ?
Repository
   ¦
   ?
PostgreSQL
```

Avec les tests correspondants.

On ne fait donc pas :

```text
? Faire tout Angular
? Puis tout Spring Boot
? Puis toute la DB
? Puis les tests
```

Mais :

```text
? F002 complète de bout en bout
```

---

# 9. La vérification

Une fois que Claude Code a terminé son travail, Ralph lance :

```text
scripts/verify.ps1
```

Ce script constitue une **barrière objective**.

Il peut vérifier par exemple :

```text
Backend
  +-- mvn test

Frontend
  +-- npm run lint
  +-- npm test
  +-- npm run build

E2E
  +-- npm test
```

Les commandes exactes évolueront avec le projet.

---

# 10. Si la vérification réussit

Exemple :

```text
F002
attempt 1

Claude Code
  ?
implémentation

verify.ps1
  ?
PASS
```

Ralph marque alors :

```json
{
  "id": "F002",
  "status": "done",
  "attempts": 1
}
```

Puis il passe automatiquement à la prochaine feature.

```text
F002 ? DONE
       ¦
       ?
F003 ? nouvelle exécution
```

---

# 11. Si la vérification échoue

Exemple :

```text
F002
attempt 1

Claude Code
  ?
implémentation

verify.ps1
  ?
FAIL
```

Ralph conserve l'information de l'échec.

Par exemple :

```json
{
  "status": "in_progress",
  "attempts": 1,
  "lastFailure": {
    "message": "Le test d'intégration de création de partie échoue."
  }
}
```

La prochaine tentative reçoit cette information.

Cela permet à l'agent de savoir :

```text
Tentative précédente :
Le test d'intégration de création de partie échoue.
```

Il peut donc corriger le problème plutôt que repartir complètement de zéro.

---

# 12. Maximum de 3 essais

Le compteur est **par feature**.

Exemple :

```text
F002

Essai 1 ? FAIL
Essai 2 ? FAIL
Essai 3 ? PASS

=> DONE
```

Le projet continue.

---

Autre exemple :

```text
F002

Essai 1 ? FAIL
Essai 2 ? FAIL
Essai 3 ? FAIL

=> BLOCKED
=> RALPH STOP
```

Il n'y aura pas :

```text
F002 ? FAIL
F003 ? exécution
F004 ? exécution
```

La boucle s'arrête volontairement.

---

# 13. Pourquoi arrêter Ralph ?

Le but est d'éviter qu'un agent autonome accumule les problèmes.

Sans limite :

```text
FAIL
 ?
retry
 ?
FAIL
 ?
retry
 ?
FAIL
 ?
modification de plus en plus importante
 ?
architecture potentiellement cassée
```

Avec la limite :

```text
FAIL
FAIL
FAIL
 ?
BLOCKED
 ?
STOP
```

On peut alors intervenir humainement.

---

# 14. Que faire lorsqu'une feature est `blocked` ?

Ralph s'arrête.

Il faut regarder :

```text
prd.json
.ralph/logs/
progress.md
```

Et notamment le dernier log :

```text
.ralph/logs/
```

On peut alors comprendre :

* ce que l'agent a essayé ;
* quelle vérification a échoué ;
* quelles modifications ont été effectuées ;
* pourquoi les trois tentatives ont échoué.

On peut ensuite corriger manuellement le problème ou améliorer la specification.

---

# 15. Les specifications

Chaque feature possède sa propre specification.

Exemple :

```text
docs/features/F002-creer-partie.md
```

Cette specification décrit :

```text
Objectif
Périmètre
Frontend
Backend
Database
Tests
Critères d'acceptation
```

Elle doit rester orientée **fonctionnalité métier**.

Par exemple :

```text
F002 — Créer une partie
```

plutôt que :

```text
F002 — Créer PartyController.java
```

La feature peut ensuite décider qu'elle nécessite :

```text
Angular
Spring Boot
PostgreSQL
Tests E2E
```

---

# 16. Le rôle des Skills

Les skills dans :

```text
.agents/skills/
```

donnent à l'agent des règles spécifiques.

Exemple :

```text
.agents/skills/angular/SKILL.md
.agents/skills/springboot/SKILL.md
.agents/skills/database/SKILL.md
.agents/skills/testing/SKILL.md
.agents/skills/design-system/SKILL.md
```

Ils servent à éviter que chaque feature réinvente les mêmes règles.

Par exemple :

```text
Database Skill

Toute modification PostgreSQL
        ?
Migration obligatoire
```

ou :

```text
Design System Skill

Nouvel écran
        ?
Lire DESIGN.md
        ?
Réutiliser les composants existants
```

---

# 17. Le rôle de `AGENTS.md`

`AGENTS.md` contient les règles globales du projet.

C'est le contrat que l'agent doit respecter.

Exemples :

```text
- architecture
- conventions Angular
- conventions Spring Boot
- règles DB
- règles de test
- règles Git
- Definition of Done
```

Il ne doit pas contenir les détails d'une feature particulière.

---

# 18. Le rôle de `RALPH.md`

`RALPH.md` décrit le fonctionnement de Ralph.

Il explique notamment :

```text
- comment fonctionne la boucle ;
- les états ;
- les tentatives ;
- les conditions d'arrêt ;
- la Definition of Done.
```

Différence :

```text
AGENTS.md
    ?
Comment travailler sur CE projet ?

RALPH.md
    ?
Comment fonctionne LA BOUCLE ?

prompt.md
    ?
Que dois-je faire PENDANT CETTE TENTATIVE ?
```

---

# 19. Lancer Ralph

Depuis la racine :

```powershell
.\ralph.ps1
```

Ralph va alors faire :

```text
1. Lire prd.json
2. Trouver F001
3. Passer F001 en in_progress
4. attempts = 1
5. Construire le prompt
6. Lancer Claude Code
7. Vérifier
8. Si PASS ? F001 done
9. Trouver F002
10. Recommencer
```

---

# 20. Exemple complet

Imaginons :

```text
F001 Initialiser le projet
F002 Créer une partie
F003 Lister les parties
```

Exécution :

```text
Ralph
 ¦
 +-- F001
 ¦    +-- attempt 1
 ¦    +-- PASS
 ¦
 +-- F002
 ¦    +-- atte
```

# Connexion Discord / Google (F004)

L'authentification repose sur OAuth2 / OpenID Connect (Spring Security `oauth2-client`) : aucun mot de passe n'est géré par l'application. La session est portée par un cookie côté serveur ; `GET /api/me` renvoie l'utilisateur courant (`401` sinon) et `POST /api/logout` termine la session. Les écritures (`POST`) exigent l'en-tête `X-XSRF-TOKEN` (Angular l'ajoute à partir du cookie `XSRF-TOKEN`).

## Variables d'environnement

Les identifiants ne sont jamais committés : ils sont lus depuis l'environnement (modèle : `environnements/.env.example`).

| Variable | Rôle |
| --- | --- |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID` / `_CLIENT_SECRET` | Client OAuth Google |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_DISCORD_CLIENT_ID` / `_CLIENT_SECRET` | Application Discord |
| `CORS_ALLOWED_ORIGINS` | Origines autorisées (avec cookies), `http://localhost:4200` par défaut |

Sans identifiants le backend démarre quand même (valeur factice `not-configured`) mais la connexion échoue chez le fournisseur. Ne pas définir une variable vide : elle écraserait la valeur par défaut.

## URL de redirection à déclarer

Le navigateur passe par le frontend (proxy Angular en développement, nginx en Docker), qui relaie `/oauth2/**` et `/login/oauth2/**` vers le backend :

- Google : `http://localhost:4200/login/oauth2/code/google`
- Discord : `http://localhost:4200/login/oauth2/code/discord`

(En accès direct au backend, remplacer par `http://localhost:8080/...`.) Chez Discord, activer les scopes `identify` et `email` ; chez Google, `openid`, `profile`, `email`.

## Tests

Aucun appel réel n'est fait : les tests backend simulent la connexion, et le e2e démarre un faux fournisseur Discord (`e2e/mock-oauth/server.js`, port 9100) vers lequel le backend est redirigé par variables d'environnement.
