import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateGamePage } from './create-game-page';

describe('CreateGamePage', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [CreateGamePage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(CreateGamePage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const http = TestBed.inject(HttpTestingController);
    const type = (selector: string, value: string) => {
      const input = el.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const q = (testId: string) => el.querySelector(`[data-testid="${testId}"]`);
    return { fixture, http, type, submit, q };
  }

  it('does not call the API and shows an error when the name is empty', async () => {
    const { http, submit, q } = setup();
    await submit();
    http.expectNone('/api/games');
    expect(q('name-error')?.textContent).toContain('Le nom est obligatoire');
  });

  it('rejects a whitespace-only name', async () => {
    const { http, type, submit, q } = setup();
    type('#name', '   ');
    await submit();
    http.expectNone('/api/games');
    expect(q('name-error')).not.toBeNull();
  });

  it('creates the game and confirms', async () => {
    const { http, type, submit, q, fixture } = setup();
    type('#name', 'La Mine perdue');
    await submit();
    const req = http.expectOne('/api/games');
    expect(req.request.body).toEqual({ name: 'La Mine perdue', description: undefined });
    req.flush({ id: 1, name: 'La Mine perdue', description: null, createdAt: '2026-10-05T00:00:00Z' });
    await fixture.whenStable();
    expect(q('game-created')?.textContent).toContain('La Mine perdue');
  });

  it('shows the server validation error on the name', async () => {
    const { http, type, submit, q, fixture } = setup();
    type('#name', 'x');
    await submit();
    http.expectOne('/api/games').flush(
      { message: 'Données invalides', fieldErrors: { name: 'Le nom est obligatoire' } },
      { status: 400, statusText: 'Bad Request' },
    );
    await fixture.whenStable();
    expect(q('name-error')?.textContent).toContain('Le nom est obligatoire');
  });

  it('shows a generic error when the server fails', async () => {
    const { http, type, submit, q, fixture } = setup();
    type('#name', 'x');
    await submit();
    http.expectOne('/api/games').flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(q('form-error')?.textContent).toContain('Impossible de créer la partie');
  });
});
