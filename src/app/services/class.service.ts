import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

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

  exists(id: number): Observable<boolean> {
    return this.http.get(`${this.CLASS_URL}/${id}`, this.httpOptions).pipe(
      map(() => true),
      catchError(err => {
        if (err.status === 404) {
          return of(false);
        }
        return throwError(() => err)
      })
    );
  }
}
