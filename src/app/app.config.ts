
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './jwt.interceptor';
import { guestInterceptor } from './guest.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // jwtInterceptor runs first — attaches the Bearer token to every request.
    // guestInterceptor runs second — blocks writes and masks reg numbers for guests.
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, guestInterceptor])
    ),
    provideAnimationsAsync()
  ]
};
