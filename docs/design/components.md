# Components

## UI (`frontend/angular/src/app/ui/`)
- Button — directive `appButton` sur `<button>`/`<a>`, `variant` : primary | warm | secondary | ghost
- Card — `<app-card [interactive]>`
- Input — directive `appInput` sur `<input>`/`<textarea>` (état invalide via `aria-invalid`)
- Badge — `<app-badge tone="neutral|success|warning|danger|info">`
- Toast — `ToastService.show(message, tone)` + `<app-toast-outlet>` (monté dans l'app)
- Spinner — `<app-spinner>` (contenu projeté = libellé)
- EmptyState — `<app-empty-state heading="…">` (`[description]` et actions projetées)

## À créer (non utilisés pour l'instant)
- Select
- Modal
- Dialog
- Tabs

## Thème
- `ThemeService` (`app/theme/`) : `theme()`, `toggle()` ; persistance `localStorage['theme']`.

## Domaine
- CharacterCard
- CharacterSheet
- HealthBar
- DiceRoller
- PartyCard
- InitiativeTracker
- CombatLog
- SessionCard
- CreatureCard

Réutiliser les composants existants avant d'en créer de nouveaux.
