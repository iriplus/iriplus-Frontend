import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';

export interface UploadTuitionsResponse {
  message: string;
  updated_count: number;
  updated_dnis: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TuitionService {
  private readonly UPLOAD_URL = `${environment.backendUrl}/tuitions/upload`;

  constructor(private http: HttpClient) {}

  uploadTuitions(file: File): Observable<UploadTuitionsResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<UploadTuitionsResponse>(this.UPLOAD_URL, formData, {
        withCredentials: true,
      })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
