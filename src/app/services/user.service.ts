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
    return this.http.get<User>(`${this.USER_URL}/email/${email}`, {withCredentials: true}).pipe(
      catchError(err => throwError(() => err))
    )
  }

  getUserByDNI(dni: string): Observable<User> {
    return this.http.get<User>(`${this.USER_URL}/dni/${dni}`, {withCredentials: true}).pipe(
      catchError(err => throwError(() => err))
    )
  }

  getTeachers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.USER_URL}/teacher`, {withCredentials: true}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createTeacher(user: User): Observable<User> {
   return this.http.post<User>(`${this.USER_URL}/teacher`, user, {withCredentials: true}).pipe(
    catchError(err => throwError(() => err))
    );
  }

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.USER_URL}/${userId}`, userData, {withCredentials: true}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.USER_URL}/${userId}`, {withCredentials: true}).pipe(
      catchError(err => throwError(() => err))
    );
  }

}
