import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function mockPrefersLight(light: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (q: string) => ({ matches: light && q.includes('light'), media: q }) as MediaQueryList,
  });
}

describe('ThemeService', () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset['theme'];
    vi.restoreAllMocks();
  });

  it('defaults to dark when the system has no light preference', () => {
    mockPrefersLight(false);
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('follows prefers-color-scheme: light', () => {
    mockPrefersLight(true);
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });

  it('prefers the stored choice over the system preference', () => {
    mockPrefersLight(true);
    localStorage.setItem('theme', 'dark');
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('toggles, persists and applies data-theme on <html>', () => {
    mockPrefersLight(false);
    const service = TestBed.inject(ThemeService);
    service.toggle();
    TestBed.tick();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.dataset['theme']).toBe('light');
    service.toggle();
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
