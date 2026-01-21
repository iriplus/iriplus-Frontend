import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError, of } from 'rxjs';
import { Login, LoginResponse } from '../interfaces/login.interface';
import { User } from '../interfaces/user.interface';
import { RegisterStudent } from '../interfaces/register.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated: boolean | null = null;
  private userType: string | null = null;


  private resetPasswordUntil: number | null = null;
  private readonly RESET_PASSWORD_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

  private readonly ME_URL = `${environment.backendUrl}/me`;
  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`;
  private readonly LOGIN_URL = `${environment.backendUrl}/login`;
  private readonly REGISTER_URL = `${environment.backendUrl}/user/student`;
  private readonly FORGOT_PASSWORD_URL = `${environment.backendUrl}/forgot-password`;
  private readonly RESET_PASSWORD_URL = `${environment.backendUrl}/reset-password`;

  constructor(
    private http: HttpClient,
  ) {}

  login(credentials: Login) {
    return this.http.post<LoginResponse>(this.LOGIN_URL, credentials, {withCredentials: true});
  }

  register(userData: User) {
    console.log(userData);
    return this.http.post(this.REGISTER_URL, userData);
  }

  checkAuth() {
    if (this.authenticated !== null) {
      return of(this.authenticated);
    }
    
    return this.http.get<User>(this.ME_URL, { withCredentials: true }).pipe(
      map((user) => {
        this.authenticated = true;
        this.userType = user.type;
        console.log('AUTHENTICATED:', this.authenticated);
        console.log('USER TYPE:', user.type);
        console.log('USER TYPE:', this.userType);
        return true;
      }),
      catchError(() => {
        this.authenticated = false;
        this.userType = null;
        return of(false);
      })
    );
  }

  setAuthenticated(value: boolean) {
    this.authenticated = value;
  }

  isAuthenticated(): boolean {
    return this.authenticated === true;
  }

  setIsResettingPassword(value: boolean) {
    if (value) {
      this.resetPasswordUntil = Date.now() + this.RESET_PASSWORD_TTL_MS;
    } else {
      this.resetPasswordUntil = null;
    }
  }

  getIsResettingPassword(): boolean {
    if (!this.resetPasswordUntil) return false;

    if (Date.now() > this.resetPasswordUntil) {
      this.resetPasswordUntil = null;
      return false;
    }

    return true;
  }

  getUserType(): string | null {
  return this.userType;
}

  loadMe() {
  return this.http.get<User>(this.ME_URL, { withCredentials: true }).pipe(
    map(user => {
      this.authenticated = true;
      this.userType = user.type;
      return user;
    }),
    catchError(() => {
      this.authenticated = false;
      this.userType = null;
      return of(null);
    })
  );
}



  logout() {
    return this.http.post(this.LOGOUT_URL, {}, { withCredentials: true });
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
