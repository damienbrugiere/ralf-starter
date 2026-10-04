import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';

export interface CurrentUser {
  id: number;
  provider: 'DISCORD' | 'GOOGLE';
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly current = signal<CurrentUser | null>(null);
  private loaded = false;

  /** Utilisateur courant (null si non connecté ou pas encore chargé). */
  readonly user = this.current.asReadonly();

  /** Charge l'utilisateur courant une seule fois ; renvoie null si non connecté. */
  ensureLoaded(): Observable<CurrentUser | null> {
    return this.loaded ? of(this.current()) : this.refresh();
  }

  refresh(): Observable<CurrentUser | null> {
    return this.http.get<CurrentUser>('/api/me').pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return of(null);
        }
        throw error;
      }),
      tap((user) => {
        this.current.set(user);
        this.loaded = true;
      }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/logout', null).pipe(
      tap(() => this.clear()),
      tap(() => void this.router.navigate(['/login'])),
    );
  }

  /** Session absente ou expirée : oublie l'utilisateur. */
  clear(): void {
    this.current.set(null);
    this.loaded = true;
  }
}
