
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Allows access only if the current user has the 'guest' role.
 * Admin/student users are redirected to /home.
 * Unauthenticated visitors are redirected to /login.
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  return authService.userRole$.pipe(
    take(1),
    map(role => {
      if (role === 'guest')                        return true;
      if (role === 'admin' || role === 'student')  return router.createUrlTree(['/home']);
      return router.createUrlTree(['/login']);
    })
  );
};