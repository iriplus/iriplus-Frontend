import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Exercise, ExercisePayload } from '../interfaces/exercise.interface';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private readonly EXERCISE_URL = `${environment.backendUrl}/exercise`;

  constructor(private http: HttpClient) {}

  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.EXERCISE_URL, {
      withCredentials: true
    });
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.EXERCISE_URL}/${id}`, {
      withCredentials: true
    });
  }

  createExercise(payload: ExercisePayload): Observable<Exercise> {
    return this.http.post<Exercise>(this.EXERCISE_URL, payload, {
      withCredentials: true
    });
  }

  updateExercise(id: number, payload: ExercisePayload): Observable<Exercise> {
    return this.http.put<Exercise>(`${this.EXERCISE_URL}/${id}`, payload, {
      withCredentials: true
    });
  }

  deleteExercise(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.EXERCISE_URL}/${id}`, {
      withCredentials: true
    });
  }
}