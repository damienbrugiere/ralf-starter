import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { EmptyState } from './empty-state';
import { Input } from './input';
import { Spinner } from './spinner';
import { ToastOutlet, ToastService } from './toast';

@Component({
  imports: [Button, Card, Input, Badge, Spinner, EmptyState],
  template: `
    <button appButton variant="warm" id="b">Go</button>
    <a appButton href="/x" id="a">Lien</a>
    <app-card [interactive]="true" id="c">Contenu</app-card>
    <input appInput id="i" />
    <app-badge tone="danger" id="bd">KO</app-badge>
    <app-spinner id="s">Chargement</app-spinner>
    <app-empty-state heading="Rien" id="e"><span description>Desc</span><button appButton>Act</button></app-empty-state>
  `,
})
class Host {}

describe('UI components', () => {
  it('render with their design classes and variants', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const b = el.querySelector('#b')!;
    expect(b.classList).toContain('ui-btn');
    expect(b.getAttribute('data-variant')).toBe('warm');
    expect(el.querySelector('#a')!.getAttribute('data-variant')).toBe('primary');
    expect(el.querySelector('#c')!.getAttribute('data-interactive')).toBe('true');
    expect(el.querySelector('#i')!.classList).toContain('ui-input');
    expect(el.querySelector('#bd')!.getAttribute('data-tone')).toBe('danger');
    expect(el.querySelector('#s')!.getAttribute('role')).toBe('status');
    expect(el.querySelector('#s')!.textContent).toContain('Chargement');
    expect(el.querySelector('#e')!.textContent).toContain('Rien');
    expect(el.querySelector('#e')!.textContent).toContain('Desc');
  });
});

describe('Toast', () => {
  it('shows then dismisses a message', async () => {
    const fixture = TestBed.createComponent(ToastOutlet);
    TestBed.inject(ToastService).show('Bravo', 'success');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Bravo');
    (fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[data-testid="toast"]')).toBeNull();
  });

  it('auto-dismisses after a delay', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ToastService);
    service.show('Temp');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(0);
    vi.useRealTimers();
  });
});
