import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge, Button, Card } from '../ui';
import { HealthService } from './health.service';

type BackendState = 'loading' | 'up' | 'down';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Button, Card, Badge],
  template: `
    <section class="hero">
      <h1>Bienvenue</h1>
      <p class="intro">Plateforme de jeu de rôle.</p>
      <div class="actions">
        <a routerLink="/games" appButton>Voir les parties</a>
        <a routerLink="/games/new" appButton variant="warm">Créer une partie</a>
      </div>
    </section>
    <app-card class="status-card" aria-live="polite">
      <h2>État du serveur</h2>
      <p data-testid="backend-status" [class]="'status status-' + state()">
        @switch (state()) {
          @case ('loading') { Vérification en cours… }
          @case ('up') { Serveur disponible }
          @case ('down') { Serveur indisponible }
        }
      </p>
      <app-badge [tone]="state() === 'up' ? 'success' : state() === 'down' ? 'danger' : 'neutral'">
        {{ state() === 'up' ? 'En ligne' : state() === 'down' ? 'Hors ligne' : 'En attente' }}
      </app-badge>
    </app-card>
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
