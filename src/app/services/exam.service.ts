import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExamDTO, ExamReviewDTO, SubmitStudentExamPayload, SubmitStudentExamResponse } from '../interfaces/exam.interface';


@Injectable({
  providedIn: 'root'
})
export class ExamService {


  private readonly EXAM_URL = `${environment.backendUrl}/exam`;


  constructor(private http: HttpClient) {}


  getAllExams(): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(`${this.EXAM_URL}`, { withCredentials: true });
  }


  getTeacherExams(): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(`${this.EXAM_URL}/teacher`, { withCredentials: true });
  }


  getStudentExams(): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(`${this.EXAM_URL}/student`, { withCredentials: true });
  }


  getTeacherClasses(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/teacher/classes`);
  }


  getExerciseTypes(): Observable<any> {
    return this.http.get(`${this.EXAM_URL}/exercise`);
  }

  generateExam(exam_data: any): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/generate`, exam_data, {withCredentials: true});
  }

  generateStudentExam(exam_data: { class_id: number; exercise_type_ids: number[] }): Observable<{ exam_id: number }> {
    return this.http.post<{ exam_id: number }>(
      `${this.EXAM_URL}/generate_student`,
      exam_data,
      { withCredentials: true }
    );
  }

  getFullExam(id: number): Observable<ExamDTO> {
    return this.http.get<ExamDTO>(`${this.EXAM_URL}/${id}/full`, {withCredentials: true});
  }

  getExamReview(id: number): Observable<ExamReviewDTO> {
    return this.http.get<ExamReviewDTO>(`${this.EXAM_URL}/${id}/review`, { withCredentials: true });
  }


  refineExam(id: number, feedback: string): Observable<any> {
    return this.http.post(`${this.EXAM_URL}/${id}/refine`, {feedback}, {withCredentials: true});
  }


  setOnReview(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/set-on-review`,{}, {withCredentials: true});
  }


  setOnCorrection(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/set-on-correction`,{}, {withCredentials: true});
  }


  sendToReview(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/send-to-review`,{}, {withCredentials: true});
  }


  deleteExam(examId: number): Observable<any> {
    return this.http.delete<any>(`${this.EXAM_URL}/${examId}`, { withCredentials: true });
  }


  leaveReview(examId: number): Observable<any> {
  return this.http.patch(`${this.EXAM_URL}/${examId}/leave-review`,{},{ withCredentials: true });
  }


  leaveCorrection(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/leave-correction`,{},{ withCredentials: true });
  }


  acceptExam(examId: number): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/accept`,{},{ withCredentials: true }
    );
  }


  sendToCorrection(examId: number, notes: string): Observable<any> {
    return this.http.patch(`${this.EXAM_URL}/${examId}/send-to-correction`,{ notes },{ withCredentials: true });
  }


  submitTeacherCorrection(examId: number, payload: Pick<ExamDTO, 'context' | 'exercises'>): Observable<number> {
    return this.http.patch<number>(`${this.EXAM_URL}/${examId}/submit-correction`, payload, { withCredentials: true });
  }


  exportExam(examId: number, format: string): Observable<Blob> {
    return this.http.get(`${this.EXAM_URL}/${examId}/export/${format}`, { responseType: 'blob', withCredentials: true });
  }


  submitStudentExam(examId: number, payload: SubmitStudentExamPayload): Observable<SubmitStudentExamResponse> {
    return this.http.post<SubmitStudentExamResponse>(`${this.EXAM_URL}/${examId}/submit`,payload,{ withCredentials: true });
  }
}
