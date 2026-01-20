import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Class } from '../interfaces/class.interface';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly CLASS_URL = `${environment.backendUrl}/class`;

  constructor(
    private http: HttpClient,
  ){}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  getClass(class_code: string): Observable<Class> {
    return this.http.get<Class>(`${this.CLASS_URL}/code/${class_code}`, this.httpOptions).pipe(
      catchError(err => throwError(() => err))
      );
  }

  getClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(this.CLASS_URL, this.httpOptions).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createClass(Class: Partial<Class>): Observable<Class> {
    return this.http.post<Class>(this.CLASS_URL, Class, this.httpOptions).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateClass(classId: number, Class: Partial<Class>): Observable<Class> {
    return this.http.put<Class>(`${this.CLASS_URL}/${classId}`,Class,this.httpOptions).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteClass(classId: number): Observable<void> {
    return this.http.delete<void>(`${this.CLASS_URL}/${classId}`,this.httpOptions).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
