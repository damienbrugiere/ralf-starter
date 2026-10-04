# CLAUDE.md

Ce projet sert à expérimenter la méthode Ralph avec Claude Code (voir `RALPH.md`, `ralph.ps1`).

@AGENTS.md

## Skills du projet
Les règles spécifiques par domaine sont dans `.agents/skills/<domaine>/SKILL.md`
(angular, springboot, database, testing, design-system, ops). Les lire avant de toucher au domaine concerné.

## Boucle Ralph
- `prd.json` est la source de vérité ; seul `ralph.ps1` modifie statut et tentatives.
- `scripts/verify.ps1` est la barrière objective (code 0 = feature validée).
- Les logs de chaque tentative sont dans `.ralph/logs/`.
