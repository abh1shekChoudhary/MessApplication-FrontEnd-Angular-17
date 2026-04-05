import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Allows access only if the current user has the 'admin' role.
 * Students and guests are redirected to /home.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return authService.userRole$.pipe(
    take(1),
    map(role => {
      if (role === 'admin') return true;
      return router.createUrlTree(['/home']);
    })
  );
};
