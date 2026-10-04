import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  function render(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } }],
    });
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('offers Discord and Google sign-in', () => {
    const el = render();
    const discord = el.querySelector('[data-testid="login-discord"]') as HTMLAnchorElement;
    const google = el.querySelector('[data-testid="login-google"]') as HTMLAnchorElement;
    expect(discord.textContent).toContain('Se connecter avec Discord');
    expect(discord.getAttribute('href')).toBe('/oauth2/authorization/discord');
    expect(google.textContent).toContain('Se connecter avec Google');
    expect(google.getAttribute('href')).toBe('/oauth2/authorization/google');
    expect(el.querySelector('[data-testid="login-message"]')).toBeNull();
  });

  it('explains a refused login', () => {
    const el = render({ error: 'denied' });
    expect(el.querySelector('[data-testid="login-message"]')?.textContent).toContain('refusée ou annulée');
  });

  it('explains a provider error', () => {
    const el = render({ error: 'provider' });
    expect(el.querySelector('[data-testid="login-message"]')?.textContent).toContain('indisponible');
  });

  it('explains an expired session', () => {
    const el = render({ expired: '1' });
    expect(el.querySelector('[data-testid="login-message"]')?.textContent).toContain('expiré');
  });
});
