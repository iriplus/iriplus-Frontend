import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HomeAnalyticsResponse,
  CoordinatorAnalyticsStats,
  TuitionAnalyticsResponse,
} from '../interfaces/analytics.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  /**
   * Home analytics endpoint.
   * The backend decides which role-specific block can be safely returned.
   */
  private readonly HOME_URL = `${environment.backendUrl}/home`;

  private readonly TUITION_ANALYTICS_URL = `${environment.backendUrl}/tuitions/analytics`;

  constructor(private readonly http: HttpClient) {}

  getHomeAnalytics(): Observable<HomeAnalyticsResponse> {
    return this.http.get<HomeAnalyticsResponse>(this.HOME_URL, {
      withCredentials: true,
    });
  }

  getTuitionAnalytics(): Observable<TuitionAnalyticsResponse> {
    return this.http.get<TuitionAnalyticsResponse>(this.TUITION_ANALYTICS_URL, {
      withCredentials: true,
    });
  }
}