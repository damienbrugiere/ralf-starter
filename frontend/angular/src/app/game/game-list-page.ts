import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Game, GameService } from './game.service';

type ListState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-game-list-page',
  imports: [RouterLink],
  template: `
    <h1>Parties</h1>
    <p><a routerLink="/games/new" class="cta">Créer une partie</a></p>
    @switch (state()) {
      @case ('loading') {
        <p class="info" data-testid="games-loading">Chargement des parties…</p>
      }
      @case ('error') {
        <div class="error" role="alert" data-testid="games-error">
          <p>Impossible de charger les parties.</p>
          <button type="button" (click)="load()">Réessayer</button>
        </div>
      }
      @case ('ready') {
        @if (games().length === 0) {
          <p class="info empty" data-testid="games-empty">Aucune partie pour le moment.</p>
        } @else {
          <ul class="games" data-testid="games-list">
            @for (game of games(); track game.id) {
              <li class="game" data-testid="game-item">
                <h2>{{ game.name }}</h2>
                @if (game.description) {
                  <p>{{ game.description }}</p>
                }
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
