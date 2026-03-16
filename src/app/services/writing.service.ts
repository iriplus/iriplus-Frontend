import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  WritingReviewRequest,
  WritingReviewResponse,
} from '../interfaces/writing.interface';

@Injectable({
  providedIn: 'root',
})
export class WritingService {
  private readonly WRITING_URL = `${environment.backendUrl}/writing`;

  constructor(private http: HttpClient) {}

  reviewWriting(body: WritingReviewRequest): Observable<WritingReviewResponse> {
    return this.http.post<WritingReviewResponse>(
      `${this.WRITING_URL}/review`,
      body,
      { withCredentials: true }
    );
  }
}

