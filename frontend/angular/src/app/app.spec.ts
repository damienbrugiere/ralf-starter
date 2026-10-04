import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('JDR Platform');
  });

  it('hides the user menu when logged out', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-testid="user-menu"]')).toBeNull();
  });

  it('shows the user name, avatar and a logout button when logged in', async () => {
    const fixture = TestBed.createComponent(App);
    TestBed.inject(AuthService).ensureLoaded().subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/me')
      .flush({ id: 1, provider: 'DISCORD', displayName: 'Alice', avatarUrl: 'http://img/a.png' });
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="user-name"]')?.textContent).toContain('Alice');
    expect(el.querySelector('img.avatar')?.getAttribute('src')).toBe('http://img/a.png');
    expect(el.querySelector('button.logout')?.textContent).toContain('Se déconnecter');
  });

  it('logs out when clicking the logout button', async () => {
    const fixture = TestBed.createComponent(App);
    const auth = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.ensureLoaded().subscribe();
    http.expectOne('/api/me').flush({ id: 1, provider: 'GOOGLE', displayName: 'Bob' });
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('button.logout') as HTMLButtonElement).click();
    http.expectOne({ url: '/api/logout', method: 'POST' }).flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();
    expect(auth.user()).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="user-menu"]')).toBeNull();
  });
});
