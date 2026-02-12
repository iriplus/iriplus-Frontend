import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getTeacherClasses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/teacher/classes`);
  }

  getExerciseTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/exercise`);
  }

  generateExam(payload: {class_id: number; context: string; exercise_type_ids: number[];}): Observable<any> {
    return this.http.post(`${this.baseUrl}/exam/generate`, payload);
  }

  iterateExam(payload: {exam_id: number; change_request: string;}): Observable<any> {
    return this.http.post(`${this.baseUrl}/exam/iterate`, payload);
  }

  sendToReview(examId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/exam/${examId}/send-to-review`, {});
  }

  deleteExam(examId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/exam/${examId}/soft-delete`, {});
  }
}
