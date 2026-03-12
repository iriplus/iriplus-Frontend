import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  @Input() type: NotificationType = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() dismissible = true;
  @Input() showIcon = true;

  @Output() closed = new EventEmitter<void>();

  get titleText(): string {
    if (this.title && this.title.trim().length > 0) {
      return this.title;
    }

    switch (this.type) {
      case 'success':
        return 'Operation Successful';
      case 'error':
        return 'Operation Failed';
      case 'warning':
        return 'Attention';
      default:
        return 'Notification';
    }
  }
}
