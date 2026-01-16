import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_URL = `${environment.backendUrl}/user`;

  constructor(
    private http: HttpClient,
  ){}
  
  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.USER_URL}/email/${email}`).pipe(
      catchError(err => throwError(() => err))
    )
  }

  getUserByDNI(dni: string): Observable<User> {
    return this.http.get<User>(`${this.USER_URL}/dni/${dni}`).pipe(
      catchError(err => throwError(() => err))
    )
  }
}
