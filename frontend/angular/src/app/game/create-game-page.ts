import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, Card, Input, ToastService } from '../ui';
import { Game, GameService } from './game.service';

@Component({
  selector: 'app-create-game-page',
  imports: [ReactiveFormsModule, Button, Card, Input],
  template: `
    <h1>Créer une partie</h1>
    <app-card><form class="game-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="field">
        <label for="name">Nom</label>
        <input appInput id="name" type="text" formControlName="name" maxlength="100" required
               [attr.aria-invalid]="showNameError() ? 'true' : null"
               aria-describedby="name-error" />
        @if (showNameError()) {
          <p id="name-error" class="field-error" data-testid="name-error">
            {{ serverNameError() ?? 'Le nom est obligatoire' }}
          </p>
        }
      </div>
      <div class="field">
        <label for="description">Description (optionnelle)</label>
        <textarea appInput id="description" rows="4" formControlName="description" maxlength="2000"></textarea>
      </div>
      @if (errorMessage()) {
        <p class="form-error" role="alert" data-testid="form-error">{{ errorMessage() }}</p>
      }
      <button type="submit" appButton variant="warm" [disabled]="submitting()">{{ submitting() ? 'Création…' : 'Créer la partie' }}</button>
    </form></app-card>
    @if (created(); as game) {
      <p class="success" role="status" data-testid="game-created">
        Partie « {{ game.name }} » créée.
      </p>
    }
  `,
  styleUrl: './create-game-page.scss',
})
export class CreateGamePage {
  private readonly games = inject(GameService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    description: ['', [Validators.maxLength(2000)]],
  });
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly created = signal<Game | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly serverNameError = signal<string | null>(null);

  protected showNameError(): boolean {
    const name = this.form.controls.name;
    return (name.invalid && (name.touched || this.submitted())) || this.serverNameError() !== null;
  }

  protected submit(): void {
    this.submitted.set(true);
    this.created.set(null);
    this.errorMessage.set(null);
    this.serverNameError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, description } = this.form.getRawValue();
    this.submitting.set(true);
    this.games.create({ name: name.trim(), description: description.trim() || undefined }).subscribe({
      next: (game) => {
        this.submitting.set(false);
        this.created.set(game);
        this.toast.show(`Partie « ${game.name} » créée.`);
        this.submitted.set(false);
        this.form.reset();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const nameError = err.status === 400 ? err.error?.fieldErrors?.name : undefined;
        if (nameError) {
          this.serverNameError.set(nameError);
        } else {
          this.errorMessage.set('Impossible de créer la partie. Veuillez réessayer.');
        }
      },
    });
  }
}
