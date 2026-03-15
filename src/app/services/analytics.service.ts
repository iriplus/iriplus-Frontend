import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HomeAnalyticsResponse } from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly HOME_URL = `${environment.backendUrl}/home`;

  constructor(private readonly http: HttpClient) {}

  getHomeAnalytics(): Observable<HomeAnalyticsResponse> {
    return this.http.get<HomeAnalyticsResponse>(this.HOME_URL, {
      withCredentials: true,
    });
  }
}