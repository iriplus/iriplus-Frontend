import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private readonly EXAM_URL = `${environment.backendUrl}/exam`;

  constructor(private http: HttpClient) {}

  getTeacherClasses(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/teacher/classes`);
  }

  getExerciseTypes(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/exercise`);
  }

  generateExam(exam_data: any): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/generate`, exam_data, {withCredentials: true});
  }

  getFullExam(id: number): Observable<any> {
    return this.http.get<any>(`${this.EXAM_URL}/${id}/full`, {withCredentials: true})
  }

  refineExam(id: number, feedback: string): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/${id}/refine`, feedback, {withCredentials: true});
  }

  sendToReview(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/send-to-review`, {});
  }

  deleteExam(examId: number): Observable<any> {
    return this.http.delete<any>(`${this.EXAM_URL}/${examId}`);
  }
}
