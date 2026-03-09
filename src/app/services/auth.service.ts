import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, Observable, tap, shareReplay, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login, LoginResponse } from '../interfaces/login.interface';
import { User, UserType } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated: boolean | null = null;
  private currentUser: User | null = null;
  private userType: UserType | null = null;

  private meRequest$: Observable<User | null> | null = null;

  private resetPasswordUntil: number | null = null;
  private readonly RESET_PASSWORD_TTL_MS = 60 * 60 * 1000;

  private readonly ME_URL = `${environment.backendUrl}/me`;
  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`;
  private readonly LOGIN_URL = `${environment.backendUrl}/login`;
  private readonly REGISTER_URL = `${environment.backendUrl}/user/student`;
  private readonly FORGOT_PASSWORD_URL = `${environment.backendUrl}/forgot-password`;
  private readonly RESET_PASSWORD_URL = `${environment.backendUrl}/reset-password`;

  constructor(private http: HttpClient) {}

  private isUserType(value: unknown): value is UserType {
    return (
      typeof value === 'string' &&
      Object.values(UserType).includes(value as UserType)
    );
  }

  private normalizeMeResponse(user: User): User | null {
    if (!this.isUserType(user.type)) {
      return null;
    }

    return {
      ...user,
      type: user.type
    };
  }

  private setAuthState(user: User): void {
    this.authenticated = true;
    this.currentUser = user;
    this.userType = user.type;
  }

  private clearAuthState(): void {
    this.authenticated = false;
    this.currentUser = null;
    this.userType = null;
  }

  private resetAuthState(): void {
    this.authenticated = null;
    this.currentUser = null;
    this.userType = null;
  }

  login(credentials: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.LOGIN_URL, credentials, {
      withCredentials: true
    }).pipe(
      tap(() => { 
        this.resetAuthState();
      })
    );
  }

  register(userData: User) {
    return this.http.post(this.REGISTER_URL, userData);
  }

  checkAuth(force = false): Observable<boolean> {
    if (!force && this.authenticated !== null) {
      return of(this.authenticated);
    }

    return this.loadMe(force).pipe(
      map((user) => !!user)
    );
  }

  loadMe(force = false): Observable<User | null> {
    if (!force && this.currentUser) {
      return of(this.currentUser);
    }

    if (!force && this.authenticated === false) {
      return of(null);
    }

    if (!force && this.meRequest$) {
      return this.meRequest$;
    }

    const request$ = this.http.get<User>(this.ME_URL, { withCredentials: true }).pipe(
      map((rawUser) => {
        const user = this.normalizeMeResponse(rawUser);

        if (!user) {
          this.clearAuthState();
          return null;
        }

        this.setAuthState(user);
        return user;
      }),
      catchError((err) => {
        console.log('Error fetching /me:', err);
        this.clearAuthState();
        return of(null);
      }),
      finalize(() => {
        this.meRequest$ = null;
      }),
      shareReplay(1)
    );

    this.meRequest$ = request$;
    return request$;
  }

  setAuthenticated(value: boolean): void {
    this.authenticated = value;

    if (!value) {
      this.currentUser = null;
      this.userType = null;
    }
  }

  isAuthenticated(): boolean {
    return this.authenticated === true;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentUserId(): number | null {
    return this.currentUser?.id ?? null;
  }

  getUserType(): UserType | null {
    return this.userType;
  }

  setIsResettingPassword(value: boolean): void {
    if (value) {
      this.resetPasswordUntil = Date.now() + this.RESET_PASSWORD_TTL_MS;
    } else {
      this.resetPasswordUntil = null;
    }
  }

  getIsResettingPassword(): boolean {
    if (!this.resetPasswordUntil) {
      return false;
    }

    if (Date.now() > this.resetPasswordUntil) {
      this.resetPasswordUntil = null;
      return false;
    }

    return true;
  }

  logout() {
    return this.http.post(this.LOGOUT_URL, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.meRequest$ = null;
        this.clearAuthState()
      })
    );
  }

  sendResetCode(email: string) {
    return this.http.post(`${this.FORGOT_PASSWORD_URL}/send`, { email });
  }

  verifyResetCode(email: string, code: string) {
    return this.http.post(`${this.FORGOT_PASSWORD_URL}/verify`, { email, code });
  }

  resetPassword(email: string, newPassword: string) {
    return this.http.post(this.RESET_PASSWORD_URL, { email, newPassword });
  }
}