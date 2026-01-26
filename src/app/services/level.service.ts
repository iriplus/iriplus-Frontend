import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Level } from '../interfaces/level.interface';

@Injectable({
  providedIn: 'root'
})
export class LevelService {

  private readonly LEVEL_URL = `${environment.backendUrl}/level`;

  private httpOptions = {
    withCredentials: true
  };

  constructor(private http: HttpClient) {}

  getLevels(): Observable<Level[]> {
    return this.http.get<Level[]>(this.LEVEL_URL, this.httpOptions);
  }

  createLevel(level: Level): Observable<Level> {
    return this.http.post<Level>(this.LEVEL_URL, level, this.httpOptions);
  }

  updateLevel(id: number, level: Level): Observable<Level> {
    return this.http.put<Level>(
      `${this.LEVEL_URL}/${id}`,
      level,
      this.httpOptions
    );
  }

  deleteLevel(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.LEVEL_URL}/${id}`,
      this.httpOptions
    );
  }
}