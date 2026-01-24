import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { UserResponse } from '../interfaces/user-response.interface';


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

  getTeachers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.USER_URL}/teacher`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createTeacher(user: User): Observable<UserResponse> {
   return this.http.post<UserResponse>(`${this.USER_URL}/teacher`,user).pipe(
    catchError(err => throwError(() => err))
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.USER_URL}/${userId}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

}
