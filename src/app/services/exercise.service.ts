import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExerciseTypeDTO } from '../interfaces/exam.interface';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {

  private readonly EXERCISE_URL = `${environment.backendUrl}/exercise`;

  constructor(private http: HttpClient) {}

  getAllExercises(): Observable<ExerciseTypeDTO[]> {
    return this.http.get<ExerciseTypeDTO[]>(`${this.EXERCISE_URL}`, {withCredentials: true}).pipe(
        catchError(err => throwError(() => err))
    );
  }
}
