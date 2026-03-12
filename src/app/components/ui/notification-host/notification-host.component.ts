import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationComponent } from '../notification/notification.component';
import { NotificationPayload, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-host',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-host.component.html',
  styleUrls: ['./notification-host.component.css'],
})
export class NotificationHostComponent implements OnInit, OnDestroy {
  notice: NotificationPayload | null = null;

  private subscription?: Subscription;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notice$.subscribe((notice) => {
      this.notice = notice;

      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = undefined;
      }

      if (notice?.autoCloseMs && notice.autoCloseMs > 0) {
        this.autoCloseTimer = setTimeout(() => this.close(), notice.autoCloseMs);
      }
    });
  }

  close(): void {
    this.notificationService.clear();
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
    this.subscription?.unsubscribe();
  }
}
