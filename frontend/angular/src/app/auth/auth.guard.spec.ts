import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function run() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    let value: boolean | UrlTree | undefined;
    result.subscribe((v) => (value = v));
    return { http, value: () => value, router: TestBed.inject(Router) };
  }

  it('lets a logged in user through', () => {
    const { http, value } = run();
    http.expectOne('/api/me').flush({ id: 1, provider: 'GOOGLE', displayName: 'Bob' });
    expect(value()).toBe(true);
  });

  it('redirects anonymous users to the login page', () => {
    const { http, value, router } = run();
    http.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(router.serializeUrl(value() as UrlTree)).toBe('/login');
  });

  it('redirects to the login page with an error when the server fails', () => {
    const { http, value, router } = run();
    http.expectOne('/api/me').flush(null, { status: 500, statusText: 'Server Error' });
    expect(router.serializeUrl(value() as UrlTree)).toBe('/login?error=provider');
  });
});
