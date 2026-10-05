# Design System — « Grimoire moderne »

Interface sobre et aérée, avec une touche d'univers jeu de rôle sans pastiche médiéval.
Source des tokens : `frontend/angular/src/styles/_tokens.scss` (aucune valeur codée en dur dans les composants).

## Direction
- Thème sombre par défaut (encre bleu-nuit), thème clair disponible.
- Le thème suit `prefers-color-scheme` ; bascule depuis l'en-tête (`data-testid="theme-toggle"`), mémorisée dans `localStorage` (clé `theme`, valeurs `dark` | `light`). Appliqué via `data-theme` sur `<html>`.
- Un seul accent vif (violet arcanique) + une teinte chaude secondaire pour les actions importantes ; le reste est neutre.
- Fond subtil : halo radial discret + grain léger ; micro-animations courtes (survol, apparition des cartes, focus), désactivées avec `prefers-reduced-motion`.
- Éviter : néon, cartoon, dégradés agressifs, glassmorphism, ornements chargés.

## Palette

| Token | Sombre | Clair |
|---|---|---|
| `--bg` | #0e1220 | #f5f5fb |
| `--surface` | #151a2c | #ffffff |
| `--surface-2` | #1c2238 | #ecedf7 |
| `--border` | #2c3454 | #d4d6ea |
| `--text` | #e9ebf7 | #181b33 |
| `--text-muted` | #a8aecb | #50567a |
| `--accent` (violet) | #8b7cf6 | #5b49d6 |
| `--on-accent` | #0e1220 | #ffffff |
| `--warm` (actions importantes) | #f0a35a | #a8480a |
| `--on-warm` | #0e1220 | #ffffff |
| `--success` | #5fd0a0 | #0f6b49 |
| `--warning` | #f0b45a | #85560a |
| `--danger` | #ff8f8f | #b42318 |
| `--info` | #7db8ff | #1e5aa8 |

Contraste WCAG AA minimum (4,5:1 texte, 3:1 composants) dans les deux thèmes.

## Typographie
- Interface : sans-serif système (`--font-ui`). Titres : police d'affichage serif humaniste (`--font-display`, Palatino/Iowan), système — aucun appel réseau.
- Échelle : `--text-xs` 0.8125rem · `--text-sm` 0.9375rem · `--text-md` 1rem · `--text-lg` 1.25rem · `--text-xl` 1.625rem · `--text-2xl` 2.25rem.

## Espacements, rayons, ombres, mouvements
- Espacements : `--space-1..8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.
- Rayons : `--radius-sm` 8, `--radius-md` 12, `--radius-lg` 18, `--radius-pill` 999 px.
- Ombres douces : `--shadow-sm`, `--shadow-md`.
- Mouvements : `--duration-fast` 120 ms, `--duration` 200 ms ; easing `--ease`.

## Accessibilité
- Focus visible partout (`--focus-ring`), navigation clavier complète.
- Cibles tactiles ≥ 44 px (`--target-min`).
- Chaque champ a un libellé ; erreurs liées par `aria-describedby`, annoncées par `role="alert"`.
- Pas de défilement horizontal à 360 px.
- `prefers-reduced-motion` : animations et transitions neutralisées.

## Composants
Voir `components.md`. Les écrans n'utilisent que ces composants et les tokens.
