import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const alice = { id: 1, provider: 'DISCORD', displayName: 'Alice' } as const;

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    return { service: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController) };
  }

  it('exposes the current user once loaded', () => {
    const { service, http } = setup();
    let result: unknown;
    service.ensureLoaded().subscribe((u) => (result = u));
    http.expectOne('/api/me').flush(alice);
    expect(result).toEqual(alice);
    expect(service.user()).toEqual(alice);
    http.verify();
  });

  it('loads only once', () => {
    const { service, http } = setup();
    service.ensureLoaded().subscribe();
    http.expectOne('/api/me').flush(alice);
    service.ensureLoaded().subscribe();
    http.verify();
  });

  it('treats 401 as not logged in', () => {
    const { service, http } = setup();
    let result: unknown = 'unset';
    service.ensureLoaded().subscribe((u) => (result = u));
    http.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(result).toBeNull();
    expect(service.user()).toBeNull();
  });

  it('propagates other errors', () => {
    const { service, http } = setup();
    let failed = false;
    service.ensureLoaded().subscribe({ error: () => (failed = true) });
    http.expectOne('/api/me').flush(null, { status: 500, statusText: 'Server Error' });
    expect(failed).toBe(true);
  });

  it('logs out, forgets the user and goes to the login page', () => {
    const { service, http } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.ensureLoaded().subscribe();
    http.expectOne('/api/me').flush(alice);
    service.logout().subscribe();
    http.expectOne({ url: '/api/logout', method: 'POST' }).flush(null, { status: 204, statusText: 'No Content' });
    expect(service.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
