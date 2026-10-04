import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    return { http: TestBed.inject(HttpClient), ctrl: TestBed.inject(HttpTestingController), navigate };
  }

  it('redirects to the login page when the session has expired', () => {
    const { http, ctrl, navigate } = setup();
    http.get('/api/games').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/games').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expired: 1 } });
    expect(TestBed.inject(AuthService).user()).toBeNull();
  });

  it('ignores 401 on /api/me', () => {
    const { http, ctrl, navigate } = setup();
    http.get('/api/me').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(navigate).not.toHaveBeenCalled();
  });
});
