import { Component, Injectable, inject, signal } from '@angular/core';
import { BadgeTone } from './badge';

export interface ToastMessage {
  id: number;
  message: string;
  tone: BadgeTone;
}

const TOAST_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(message: string, tone: BadgeTone = 'success'): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), TOAST_DURATION_MS);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}

@Component({
  selector: 'app-toast-outlet',
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <div class="toast" [attr.data-tone]="toast.tone" data-testid="toast">
        <span>{{ toast.message }}</span>
        <button type="button" class="toast-close" aria-label="Fermer la notification" (click)="service.dismiss(toast.id)">×</button>
      </div>
    }
  `,
  styleUrl: './toast.scss',
  host: { 'aria-live': 'polite', role: 'region', 'aria-label': 'Notifications' },
})
export class ToastOutlet {
  protected readonly service = inject(ToastService);
}
