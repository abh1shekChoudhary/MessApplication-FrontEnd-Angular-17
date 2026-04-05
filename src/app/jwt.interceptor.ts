import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches the JWT Bearer token to every outgoing HTTP request.
 * The token is read from localStorage where AuthService stores it after login.
 * Must be registered BEFORE guestInterceptor in app.config.ts.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
