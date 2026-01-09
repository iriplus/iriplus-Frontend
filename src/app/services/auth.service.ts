import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError, of } from 'rxjs';
import { Login, LoginResponse } from '../interfaces/login.interface';
import { User } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated: boolean | null = null;

  private readonly ME_URL = `${environment.backendUrl}/me`;
  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`;
  private readonly LOGIN_URL = `${environment.backendUrl}/login`;
  private readonly REGISTER_URL = `${environment.backendUrl}/user/student`;

  constructor(
    private http: HttpClient,
  ) {}

  login(credentials: Login) {
    return this.http.post<LoginResponse>(this.LOGIN_URL, credentials, {withCredentials: true});
  }

  register(userData: User) {
    return this.http.post(this.REGISTER_URL, userData);
  }

  checkAuth() {
    if (this.authenticated !== null) {
      return of(this.authenticated);
    }
    
    return this.http.get(this.ME_URL, { withCredentials: true }).pipe(
      map(() => {
        this.authenticated = true;
        return true;
      }),
      catchError(() => {
        this.authenticated = false;
        return of(false);
      })
    );
  }

  setAuthenticated(value: boolean) {
    this.authenticated = value;
  }

  logout() {
    return this.http.post(this.LOGOUT_URL, {}, { withCredentials: true });
  }
}
