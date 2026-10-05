import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Card, EmptyState, Spinner } from '../ui';
import { Game, GameService } from './game.service';

type ListState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-game-list-page',
  imports: [RouterLink, Button, Card, EmptyState, Spinner],
  template: `
    <div class="page-head">
      <h1>Parties</h1>
      <a routerLink="/games/new" appButton variant="warm">Créer une partie</a>
    </div>
    @switch (state()) {
      @case ('loading') {
        <div class="info" data-testid="games-loading">
          <app-spinner>Chargement des parties…</app-spinner>
        </div>
      }
      @case ('error') {
        <app-card class="error" role="alert" data-testid="games-error">
          <p>Impossible de charger les parties.</p>
          <button type="button" appButton variant="secondary" (click)="load()">Réessayer</button>
        </app-card>
      }
      @case ('ready') {
        @if (games().length === 0) {
          <app-empty-state heading="Aucune partie pour le moment." data-testid="games-empty">
            <span description>Lancez votre première aventure.</span>
            <a routerLink="/games/new" appButton>Créer une partie</a>
          </app-empty-state>
        } @else {
          <ul class="games" data-testid="games-list">
            @for (game of games(); track game.id) {
              <li data-testid="game-item">
                <app-card [interactive]="true">
                  <h2>{{ game.name }}</h2>
                  @if (game.description) {
                    <p>{{ game.description }}</p>
                  }
                </app-card>
              </li>
            }
          </ul>
        }
      }
    }
  `,
  styleUrl: './game-list-page.scss',
})
export class GameListPage {
  private readonly service = inject(GameService);
  protected readonly state = signal<ListState>('loading');
  protected readonly games = signal<Game[]>([]);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    this.service.list().subscribe({
      next: (games) => {
        this.games.set(games);
        this.state.set('ready');
      },
      error: () => this.state.set('error'),
    });
  }
}
