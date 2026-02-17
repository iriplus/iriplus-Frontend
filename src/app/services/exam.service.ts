import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExamDTO } from '../interfaces/exam.interface';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private readonly EXAM_URL = `${environment.backendUrl}/exam`;

  constructor(private http: HttpClient) {}

  getAllExams(): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(`${this.EXAM_URL}`, { withCredentials: true });
  }

  getTeacherClasses(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/teacher/classes`);
  }

  getExerciseTypes(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/exercise`);
  }

  generateExam(payload: {class_id: number; context: string; exercise_type_ids: number[];}): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/exam/generate`, payload);
  }

  iterateExam(payload: {exam_id: number; change_request: string;}): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/exam/iterate`, payload);
  }

  sendToReview(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/send-to-review`,{},{ withCredentials: true });
  }

  deleteExam(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/soft-delete`, {});
  }
}
