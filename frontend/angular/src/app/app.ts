import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { ThemeService } from './theme/theme.service';
import { Button, ToastOutlet } from './ui';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Button, ToastOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="header-inner">
        <a routerLink="/" class="brand" aria-label="JDR Platform, accueil">
          <span class="brand-mark" aria-hidden="true">✦</span>
          <span class="app-title">JDR Platform</span>
        </a>
        @if (auth.user()) {
          <nav class="app-nav" aria-label="Navigation principale">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
            <a routerLink="/games" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Parties</a>
          </nav>
        }
        <div class="header-actions">
          <button
            type="button"
            appButton
            variant="ghost"
            class="theme-toggle"
            data-testid="theme-toggle"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'"
            [attr.aria-pressed]="theme.theme() === 'light'"
            (click)="theme.toggle()"
          >
            <span aria-hidden="true">{{ theme.theme() === 'dark' ? '☀' : '☾' }}</span>
          </button>
          @if (auth.user(); as user) {
            <div class="app-user" data-testid="user-menu">
              @if (user.avatarUrl) {
                <img class="avatar" [src]="user.avatarUrl" alt="" width="32" height="32" />
              }
              <span class="user-name" data-testid="user-name">{{ user.displayName }}</span>
              <button type="button" appButton variant="secondary" class="logout" (click)="logout()">Se déconnecter</button>
            </div>
          }
        </div>
      </div>
    </header>
    <main class="app-main"><router-outlet /></main>
    <app-toast-outlet />
  `,
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
