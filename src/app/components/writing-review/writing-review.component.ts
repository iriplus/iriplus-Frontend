import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { WritingService } from '../../services/writing.service';
import { NotificationService } from '../../services/notification.service';
import { WritingFeedback } from '../../interfaces/writing.interface';

@Component({
  selector: 'app-writing-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './writing-review.component.html',
  styleUrl: './writing-review.component.css',
})
export class WritingReviewComponent {
  exercisePrompt = '';
  studentSubmission = '';

  isSubmitting = false;
  hasSubmitted = false;
  errorMessage: string | null = null;
  apiMessage: string | null = null;

  feedback: WritingFeedback | null = null;

  constructor(
    private writingService: WritingService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.feedback) {
      return;
    }

    const trimmedPrompt = this.exercisePrompt.trim();
    const trimmedSubmission = this.studentSubmission.trim();

    if (!trimmedPrompt || !trimmedSubmission) {
      this.errorMessage =
        'Please fill in both the exercise prompt and your writing.';

      this.notificationService.show({
        type: 'error',
        title: 'Missing information',
        message:
          this.errorMessage ||
          'Please fill in both the exercise prompt and your writing.',
        autoCloseMs: 4000,
      });
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    this.writingService
      .reviewWriting({
        exercise_prompt: trimmedPrompt,
        student_submission: trimmedSubmission,
      })
      .subscribe({
        next: (response) => {
          this.feedback = response.result;
          this.apiMessage = response.message ?? null;
          this.hasSubmitted = true;

          this.notificationService.show({
            type: 'success',
            title: 'Feedback ready',
            message: 'Your writing feedback has been generated.',
            autoCloseMs: 3500,
          });
        },
        error: (err) => {
          const backendMessage =
            err?.error?.message ??
            err?.error?.detail ??
            err?.message ??
            null;

          this.errorMessage =
            backendMessage ??
            'We could not generate feedback right now. Please try again later.';

          this.notificationService.show({
            type: 'error',
            title: 'Request failed',
            message:
              this.errorMessage ||
              'We could not generate feedback right now. Please try again later.',
            autoCloseMs: 5000,
          });
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  onBackToHome(): void {
    this.router.navigate(['/home']);
  }

  onPrint(): void {
    requestAnimationFrame(() => {
      window.print();
    });
  }
}
