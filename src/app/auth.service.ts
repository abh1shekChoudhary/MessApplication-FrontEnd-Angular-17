
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

// Describes the user's role and optional registration number
export interface UserSession {
  role: 'admin' | 'student' | 'guest';
  regNo?: string;
}

// Shape of the response returned by POST /auth/login and GET /auth/guest-token
interface LoginResponse {
  token: string;
  role: string;    // e.g. "ROLE_ADMIN"
  regNo: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private session = new BehaviorSubject<UserSession | null>(null);

  public isLoggedIn$:        Observable<boolean>                    = this.session.pipe(map(s => !!s));
  public userRole$:          Observable<UserSession['role'] | null> = this.session.pipe(map(s => s?.role ?? null));
  public currentUserRegNo$:  Observable<string | null>             = this.session.pipe(map(s => s?.regNo ?? null));
  public isAdmin$:           Observable<boolean>                    = this.userRole$.pipe(map(role => role === 'admin'));
  public isGuest$:           Observable<boolean>                    = this.userRole$.pipe(map(role => role === 'guest'));

  private readonly isBrowser: boolean;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      // Restore session on page reload
      const storedSession = localStorage.getItem('user_session');
      if (storedSession) {
        const session = JSON.parse(storedSession) as UserSession;
        this.session.next(session);
        this.restoreTheme(session);  // re-apply admin-theme if admin
      }
    }
  }

  /**
   * Standard login — sends credentials to POST /auth/login.
   * On success, stores the JWT and session in localStorage and navigates.
   * Returns true on success, false on failure.
   */
  public login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response  => this.handleAuthResponse(response)),
        map(()        => true),
        catchError(() => of(false))
      );
  }

  /**
   * Guest login — calls GET /auth/guest-token (no credentials required).
   * Issues a short-lived (2hr) read-only JWT from the backend.
   */
  public loginAsGuest(): Observable<boolean> {
    return this.http
      .get<LoginResponse>(`${environment.apiUrl}/auth/guest-token`)
      .pipe(
        tap(response  => this.handleAuthResponse(response)),
        map(()        => true),
        catchError(() => of(false))
      );
  }

  /** Stores JWT + session, updates the BehaviorSubject, and navigates based on role. */
  private handleAuthResponse(response: LoginResponse): void {
    if (!this.isBrowser) return;

    // Convert "ROLE_ADMIN" → "admin"
    const role = response.role.toLowerCase().replace('role_', '') as UserSession['role'];
    const session: UserSession = { role, regNo: response.regNo ?? undefined };

    localStorage.setItem('user_session', JSON.stringify(session));
    localStorage.setItem('jwt_token',    response.token);
    this.session.next(session);

    // Apply theme class — admin gets dark navy sidebar theme
    if (role === 'admin') {
      document.body.classList.add('admin-theme');
    } else {
      document.body.classList.remove('admin-theme');
    }

    if (role === 'guest') {
      this.router.navigate(['/features']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  /** Clears all auth state, removes JWT, navigates to login. */
  public logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('user_session');
      localStorage.removeItem('jwt_token');
      document.body.classList.remove('admin-theme');
      this.session.next(null);
      this.router.navigate(['/login']);
    }
  }

  /** Re-applies admin-theme on page reload if session is admin. Called from constructor. */
  private restoreTheme(session: UserSession | null): void {
    if (!this.isBrowser) return;
    if (session?.role === 'admin') {
      document.body.classList.add('admin-theme');
    } else {
      document.body.classList.remove('admin-theme');
    }
  }
}