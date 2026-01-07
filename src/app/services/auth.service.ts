import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authenticated: boolean | null = null;

  constructor(private http: HttpClient) {}

  private readonly ME_URL = `${environment.backendUrl}/me`;
  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`;



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
    this.authenticated = false;
    return this.http.post(this.LOGOUT_URL, {}, { withCredentials: true });
  }
}
