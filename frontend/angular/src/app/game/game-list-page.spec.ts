import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { GameListPage } from './game-list-page';

describe('GameListPage', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [GameListPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(GameListPage);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const http = TestBed.inject(HttpTestingController);
    const q = (id: string) => el.querySelector(`[data-testid="${id}"]`);
    return { fixture, http, q, el };
  }

  it('shows a loading state then the games', async () => {
    const { fixture, http, q, el } = setup();
    expect(q('games-loading')).not.toBeNull();
    http.expectOne('/api/games').flush([
      { id: 2, name: 'Seconde', description: 'desc', createdAt: '2026-10-05T00:00:00Z' },
      { id: 1, name: 'Première', description: null, createdAt: '2026-10-04T00:00:00Z' },
    ]);
    await fixture.whenStable();
    expect(el.querySelectorAll('[data-testid="game-item"]').length).toBe(2);
    expect(el.textContent).toContain('Seconde');
    expect(el.textContent).toContain('desc');
    expect(q('games-empty')).toBeNull();
  });

  it('shows the empty state', async () => {
    const { fixture, http, q } = setup();
    http.expectOne('/api/games').flush([]);
    await fixture.whenStable();
    expect(q('games-empty')?.textContent).toContain('Aucune partie');
  });

  it('shows an error and retries', async () => {
    const { fixture, http, q, el } = setup();
    http.expectOne('/api/games').flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(q('games-error')?.textContent).toContain('Impossible de charger les parties');

    (el.querySelector('[data-testid="games-error"] button') as HTMLButtonElement).click();
    http.expectOne('/api/games').flush([]);
    await fixture.whenStable();
    expect(q('games-error')).toBeNull();
    expect(q('games-empty')).not.toBeNull();
  });
});
