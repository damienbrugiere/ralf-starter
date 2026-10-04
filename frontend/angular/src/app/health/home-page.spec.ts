import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';

describe('HomePage', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(HomePage);
    const http = TestBed.inject(HttpTestingController);
    const text = () =>
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="backend-status"]')?.textContent?.trim();
    return { fixture, http, text };
  }

  it('shows the server as available when the API answers UP', async () => {
    const { fixture, http, text } = setup();
    http.expectOne('/api/health').flush({ status: 'UP', application: 'jdr-platform' });
    await fixture.whenStable();
    expect(text()).toBe('Serveur disponible');
  });

  it('shows the server as unavailable on error', async () => {
    const { fixture, http, text } = setup();
    http.expectOne('/api/health').flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(text()).toBe('Serveur indisponible');
  });
});
