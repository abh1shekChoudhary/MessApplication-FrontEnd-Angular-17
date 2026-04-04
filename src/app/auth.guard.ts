import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Allows access for authenticated users (admin and student).
 * Guests are redirected to /features (their designated area).
 * Unauthenticated visitors are redirected to /login.
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return authService.userRole$.pipe(
    take(1),
    map(role => {
      if (role === 'admin' || role === 'student') return true;
      if (role === 'guest') return router.createUrlTree(['/features']);
      return router.createUrlTree(['/login']);
    })
  );
};
