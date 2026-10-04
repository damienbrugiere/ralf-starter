import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HealthService } from './health.service';

type BackendState = 'loading' | 'up' | 'down';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <h1>Bienvenue</h1>
    <p class="intro">Plateforme de jeu de rôle.</p>
    <p>
      <a routerLink="/games" class="cta">Voir les parties</a>
      <a routerLink="/games/new" class="cta">Créer une partie</a>
    </p>
    <section class="status-card" aria-live="polite">
      <h2>État du serveur</h2>
      <p data-testid="backend-status" [class]="'status status-' + state()">
        @switch (state()) {
          @case ('loading') { Vérification en cours… }
          @case ('up') { Serveur disponible }
          @case ('down') { Serveur indisponible }
        }
      </p>
    </section>
  `,
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly health = inject(HealthService);
  protected readonly state = signal<BackendState>('loading');

  constructor() {
    this.health.check().subscribe({
      next: (r) => this.state.set(r.status === 'UP' ? 'up' : 'down'),
      error: () => this.state.set('down'),
    });
  }
}
