import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <span class="app-title">JDR Platform</span>
      @if (auth.user(); as user) {
        <div class="app-user" data-testid="user-menu">
          @if (user.avatarUrl) {
            <img class="avatar" [src]="user.avatarUrl" alt="" width="32" height="32" />
          }
          <span class="user-name" data-testid="user-name">{{ user.displayName }}</span>
          <button type="button" class="logout" (click)="logout()">Se déconnecter</button>
        </div>
      }
    </header>
    <main class="app-main"><router-outlet /></main>
  `,
  styleUrl: './app.scss',
})
export class App {
  protected readonly auth = inject(AuthService);

  protected logout(): void {
    this.auth.logout().subscribe();
  }
}
