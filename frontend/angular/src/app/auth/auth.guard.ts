import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.ensureLoaded().pipe(
    map((user) => (user ? true : router.createUrlTree(['/login']))),
    // Serveur indisponible : la page de connexion affiche un message plutôt qu'une page blanche.
    catchError(() => of(router.createUrlTree(['/login'], { queryParams: { error: 'provider' } }))),
  );
};
