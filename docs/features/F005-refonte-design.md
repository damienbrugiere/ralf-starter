# F005 - Refonte complète du design

L'interface actuelle (fantasy médiévale sombre : parchemin, cuir, bois, tons bruns/dorés, police Georgia) ne convient pas : couleurs ternes, écrans peu structurés. Refondre entièrement l'identité visuelle et la mise en page de l'application pour obtenir un style propre, moderne et distinctif. Aucun changement fonctionnel : le comportement, les routes et l'API restent identiques.

## Direction artistique (à formaliser dans `docs/design/DESIGN.md`)

« Grimoire moderne » : une interface sobre et aérée qui garde une touche d'univers jeu de rôle sans pastiche médiéval.

- Thème sombre par défaut (encre bleu-nuit, pas de brun), thème clair disponible ; le choix suit `prefers-color-scheme` et peut être basculé depuis l'en-tête, mémorisé dans `localStorage`
- Une seule couleur d'accent vive et cohérente (violet arcanique ou équivalent), plus une teinte secondaire chaude pour les actions importantes ; le reste est neutre
- Typographie : sans-serif moderne pour l'interface, police d'affichage avec du caractère pour les titres (polices auto-hébergées ou système, pas d'appel réseau à l'exécution)
- Surfaces : cartes à bordures fines et ombres douces, rayons généreux, beaucoup d'espace, hiérarchie claire
- Détails distinctifs mais discrets : fond subtil (grain, halo ou motif léger), micro-animations courtes (survol, apparition des cartes, focus), respect de `prefers-reduced-motion`
- Éviter : néon criard, cartoon, dégradés agressifs, effets de verre (glassmorphism), ornements chargés

## À faire

1. Réécrire `docs/design/DESIGN.md` : direction, palette (sombre et claire), échelle typographique, espacements, rayons, ombres, mouvements, règles d'accessibilité. C'est la nouvelle référence du projet.
2. Mettre en place des design tokens centralisés (variables CSS dans `styles.scss`) : plus aucune couleur, taille ou espacement codé en dur dans les composants.
3. Créer ou mettre à jour les composants UI réutilisables listés dans `docs/design/components.md` et utilisés par l'application (Button, Card, Input, Badge, Toast, Spinner, EmptyState au minimum), puis les utiliser dans tous les écrans.
4. Refondre tous les écrans existants :
   - page de connexion (mise en avant des deux boutons Discord et Google, identité de marque)
   - en-tête / navigation (logo, navigation, menu utilisateur, bascule de thème)
   - accueil (état de santé)
   - liste des parties (cartes, état vide, erreurs, chargement)
   - création d'une partie (formulaire, validation, erreurs)
5. Mise en page responsive (mobile 360 px, tablette, bureau) sans défilement horizontal.
6. États complets sur chaque écran : chargement, vide, erreur, succès, survol, focus, désactivé.

## Contraintes

- Accessibilité : contraste WCAG AA minimum dans les deux thèmes, focus visible, navigation clavier, libellés sur les champs, cibles tactiles d'au moins 44 px
- Ne pas modifier les attributs `data-testid`, les textes utilisés par les tests, les routes ni les appels API
- Aucune nouvelle dépendance lourde ; une bibliothèque de composants n'est pas nécessaire
- Pas de modification du backend ni de la base de données

## Tests

- les tests existants (frontend et e2e) passent sans être supprimés ni affaiblis ; ne les adapter que si le balisage change réellement, en conservant la même couverture
- frontend : test de la bascule de thème (persistance, valeur par défaut selon `prefers-color-scheme`) et des composants UI créés
- e2e : parcours existants inchangés ; ajouter une vérification de la bascule de thème
- `scripts/verify.ps1` doit passer

## Hors périmètre

- nouvelles fonctionnalités métier
- internationalisation
- illustrations ou logos sur mesure (un logo typographique suffit)
