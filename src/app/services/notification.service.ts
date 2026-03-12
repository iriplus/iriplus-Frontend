import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationType } from '../components/ui/notification/notification.component';

export interface NotificationPayload {
  type: NotificationType;
  message: string;
  title?: string;
  autoCloseMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly noticeSubject = new BehaviorSubject<NotificationPayload | null>(null);
  readonly notice$ = this.noticeSubject.asObservable();

  show(payload: NotificationPayload): void {
    this.noticeSubject.next(payload);
  }

  clear(): void {
    this.noticeSubject.next(null);
  }
}
