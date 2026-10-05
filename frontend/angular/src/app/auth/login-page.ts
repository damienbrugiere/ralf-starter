import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Button } from '../ui';

@Component({
  selector: 'app-login-page',
  imports: [Button],
  template: `
    <section class="login">
      <span class="mark" aria-hidden="true">✦</span>
      <p class="brand">JDR Platform</p>
      <h1>Connexion</h1>
      <p class="intro">Connectez-vous pour accéder à la plateforme.</p>
      @if (message) {
        <p class="message" role="alert" data-testid="login-message">{{ message }}</p>
      }
      <div class="providers">
        <a appButton class="provider" href="/oauth2/authorization/discord" data-testid="login-discord">Se connecter avec Discord</a>
        <a appButton variant="secondary" class="provider" href="/oauth2/authorization/google" data-testid="login-google">Se connecter avec Google</a>
      </div>
    </section>
  `,
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly message = this.buildMessage();

  private buildMessage(): string | null {
    if (this.params.get('error') === 'denied') {
      return 'Connexion refusée ou annulée. Vous pouvez réessayer.';
    }
    if (this.params.get('error')) {
      return 'La connexion a échoué : le fournisseur est indisponible ou a renvoyé une erreur. Réessayez plus tard.';
    }
    if (this.params.get('expired')) {
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    }
    return null;
  }
}
