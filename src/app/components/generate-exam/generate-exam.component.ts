import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { ExerciseService } from '../../services/exercise.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Class } from '../../interfaces/class.interface';
import { ExamDTO, ExerciseTypeDTO, Status } from '../../interfaces/exam.interface';
import { UserType } from '../../interfaces/user.interface';
import { ConfirmDialogComponent, ConfirmVariant, ConfirmDialogState } from '../ui/confirm-dialog/confirm-dialog.component';

type Step = 'form' | 'loading' | 'preview';

@Component({
  selector: 'app-generate-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './generate-exam.component.html',
  styleUrl: './generate-exam.component.css'
})

export class GenerateExamComponent implements OnInit {
  step: Step = 'form';

  classes: Class[] = [];
  exerciseTypes: ExerciseTypeDTO[] = [];
  generatedExam: ExamDTO | null = null;
  private originalExam: ExamDTO | null = null;

  saving = false;
  refining = false;
  showAiRequest = false;

  readonly Status = Status;

  form: FormGroup;

  changeRequest = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  confirmDialog: ConfirmDialogState = {
    open: false,
    action: null,
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly examService: ExamService,
    private readonly authService: AuthService,
    private readonly exerciseService: ExerciseService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      classId: ['', Validators.required],
      context: ['', Validators.required],
      exerciseTypeIds: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  get totalItems(): number {
    return (
      this.generatedExam?.exercises.reduce(
        (total, exercise) => total + exercise.items.length,
        0,
      ) ?? 0
    );
  }

  get teacherDisplayName(): string {
    return this.generatedExam?.teacher_full_name?.trim() || 'Not assigned';
  }

  get coordinatorDisplayName(): string {
    return this.generatedExam?.coordinator_full_name?.trim() || 'Not assigned';
  }

  get createdAtLabel(): string {
    if (!this.generatedExam?.date_created) {
      return '—';
    }

    const parsedDate = new Date(this.generatedExam.date_created);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(this.generatedExam.date_created);
    }

    return parsedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get previewStatusLabel(): string {
    if (!this.generatedExam) {
      return '—';
    }

    return this.generatedExam.status === 'Generating'
      ? 'Draft'
      : this.generatedExam.status;
  }

  loadInitialData(): void {
    this.authService.loadMe().subscribe({
      next: (res) => {
        if (res?.type === UserType.TEACHER && res.teacher_classes) {
          this.classes = res.teacher_classes;
        }
      },
      error: (error) => {
        this.notifyApiError(error, 'The teacher information could not be loaded.');
      },
    });

    this.exerciseService.getAllExercises().subscribe({
      next: (res) => {
        this.exerciseTypes = res;
      },
      error: (error) => {
        this.notifyApiError(error, 'The exercise types could not be loaded.');
      },
    });
  }

  onExerciseToggle(event: Event, id: number): void {
    const control = this.form.get('exerciseTypeIds');
    const currentValue = (control?.value as number[] | null) ?? [];
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      if (!currentValue.includes(id)) {
        control?.setValue([...currentValue, id]);
      }
    } else {
      control?.setValue(currentValue.filter((value) => value !== id));
    }

    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  generateExam(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.step = 'loading';

    const examData = {
      class_id: this.form.value.classId,
      context: this.form.value.context,
      exercise_type_ids: this.form.value.exerciseTypeIds,
    };

    this.examService.generateExam(examData).subscribe({
      next: (response) => {
        const examId = this.resolveExamIdFromResponse(response, 0);

        if (!examId) {
          this.step = 'form';
          this.notificationService.show({
            type: 'error',
            title: 'Generation Error',
            message: 'The generated exam id could not be resolved.',
            autoCloseMs: 5000,
          });
          return;
        }

        this.examService.getFullExam(examId).subscribe({
          next: (exam) => {
            this.generatedExam = this.cloneExam(exam);
            this.originalExam = this.cloneExam(exam);
            this.step = 'preview';

            this.notificationService.show({
              type: 'success',
              title: 'Draft Generated',
              message: 'The exam draft was generated successfully.',
              autoCloseMs: 3500,
            });
          },
          error: (error) => {
            this.step = 'form';
            this.notifyApiError(error, 'The generated exam could not be loaded.');
          },
        });
      },
      error: (error) => {
        this.step = 'form';
        this.notifyApiError(error, 'The exam could not be generated.');
      },
    });
  }

  openDiscardManualEditsConfirm(): void {
    if (!this.originalExam || this.saving || this.refining) {
      return;
    }

    this.openConfirmDialog({
      action: 'discard-manual-edits',
      title: 'Discard manual edits?',
      message:
        'All unsaved manual changes will be lost and the draft will return to the last loaded version.',
      confirmText: 'Discard edits',
      cancelText: 'Cancel',
      variant: 'danger',
    });
  }

  openDeleteDraftConfirm(): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.openConfirmDialog({
      action: 'delete-draft',
      title: 'Delete draft?',
      message:
        'This draft will be deleted and removed from your current workflow. This action cannot be undone.',
      confirmText: 'Delete draft',
      cancelText: 'Cancel',
      variant: 'danger',
    });
  }

  onConfirmDialogConfirmed(): void {
    const action = this.confirmDialog.action;
    this.closeConfirmDialog();

    if (action === 'discard-manual-edits') {
      this.discardManualEdits();
      return;
    }

    if (action === 'delete-draft') {
      this.deleteDraft();
    }
  }

  onConfirmDialogCancelled(): void {
    this.closeConfirmDialog();
  }

  private discardManualEdits(): void {
    if (!this.originalExam || this.saving || this.refining) {
      return;
    }

    this.generatedExam = this.cloneExam(this.originalExam);
    this.showAiRequest = false;
    this.resetChangeRequest();

    this.notificationService.show({
      type: 'info',
      title: 'Changes Discarded',
      message: 'All unsaved manual edits were discarded.',
      autoCloseMs: 3000,
    });
  }

  private deleteDraft(): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.examService.deleteExam(this.generatedExam.id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'Draft Deleted',
          message: 'The draft was deleted successfully.',
          autoCloseMs: 3500,
        });

        this.resetFlow();
      },
      error: (error) => {
        this.notifyApiError(error, 'The draft could not be deleted.');
      },
    });
  }

  openAiRequest(): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.showAiRequest = true;
  }

  cancelAiRequest(): void {
    if (this.refining) {
      return;
    }

    this.showAiRequest = false;
    this.resetChangeRequest();
  }

  requestAiChanges(): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    const feedback = this.changeRequest.value.trim();

    if (!feedback) {
      this.changeRequest.markAsTouched();
      return;
    }

    this.refining = true;

    this.examService.refineExam(this.generatedExam.id, feedback).subscribe({
      next: (response) => {
        const updatedExamId = this.resolveExamIdFromResponse(
          response,
          this.generatedExam!.id,
        );

        this.examService.getFullExam(updatedExamId).subscribe({
          next: (updatedExam) => {
            this.generatedExam = this.cloneExam(updatedExam);
            this.originalExam = this.cloneExam(updatedExam);
            this.refining = false;
            this.showAiRequest = false;
            this.resetChangeRequest();

            this.notificationService.show({
              type: 'success',
              title: 'AI Changes Applied',
              message: 'The draft was updated with the requested AI changes.',
              autoCloseMs: 3500,
            });
          },
          error: (error) => {
            this.refining = false;
            this.notifyApiError(error, 'The updated draft could not be loaded.');
          },
        });
      },
      error: (error) => {
        this.refining = false;
        this.notifyApiError(error, 'The AI changes could not be requested.');
      },
    });
  }

  onContextChange(event: Event): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.generatedExam.context = this.readEditableContent(event);
  }

  onQuestionChange(exerciseIndex: number, itemIndex: number, event: Event): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.generatedExam.exercises[exerciseIndex].items[itemIndex].question =
      this.readEditableContent(event);
  }

  onAnswerChange(exerciseIndex: number, itemIndex: number, event: Event): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    this.generatedExam.exercises[exerciseIndex].items[itemIndex].answer =
      this.readEditableContent(event);
  }

  saveAndSendToReview(): void {
    if (!this.generatedExam || this.saving || this.refining) {
      return;
    }

    const validationError = this.getEditableContentValidationError();
    if (validationError) {
      this.notificationService.show({
        type: 'warning',
        title: 'Validation Error',
        message: validationError,
        autoCloseMs: 4500,
      });
      return;
    }

    this.saving = true;

    this.examService.submitTeacherCorrection(this.generatedExam.id, {
      context: this.generatedExam.context,
      exercises: this.generatedExam.exercises,
    }).subscribe({
      next: () => {
        if (!this.generatedExam) {
          this.saving = false;
          return;
        }

        this.generatedExam.status = Status.PENDING_REVIEW;
        this.originalExam = this.cloneExam(this.generatedExam);
        this.saving = false;

        this.notificationService.show({
          type: 'success',
          title: 'Sent to Review',
          message: 'The exam was saved and sent to review successfully.',
          autoCloseMs: 3500,
        });

        this.router.navigate(['/exam']);
      },
      error: (error) => {
        this.saving = false;
        this.notifyApiError(error, 'The exam could not be saved.');
      },
    });
  }

  cancel(): void {
    this.resetFlow();
  }

  resetFlow(): void {
    this.step = 'form';
    this.generatedExam = null;
    this.originalExam = null;
    this.saving = false;
    this.refining = false;
    this.showAiRequest = false;

    this.form.reset({
      classId: '',
      context: '',
      exerciseTypeIds: [],
    });

    this.resetChangeRequest();
    this.closeConfirmDialog();
    this.router.navigate(['/exam']);
  }

  private getEditableContentValidationError(): string | null {
    if (!this.generatedExam) {
      return 'Exam not loaded.';
    }

    if (!this.generatedExam.context.trim()) {
      return 'Context cannot be empty.';
    }

    for (let exerciseIndex = 0; exerciseIndex < this.generatedExam.exercises.length; exerciseIndex += 1) {
      const exercise = this.generatedExam.exercises[exerciseIndex];

      for (let itemIndex = 0; itemIndex < exercise.items.length; itemIndex += 1) {
        const item = exercise.items[itemIndex];

        if (!item.question.trim()) {
          return `Question ${itemIndex + 1} in "${exercise.exercise_type}" cannot be empty.`;
        }

        if (!item.answer?.trim()) {
          return `Answer ${itemIndex + 1} in "${exercise.exercise_type}" cannot be empty.`;
        }
      }
    }

    return null;
  }

  private readEditableContent(event: Event): string {
    const target = event.target as HTMLElement | null;
    return (target?.innerText ?? '').replace(/\u00A0/g, ' ').trim();
  }

  private resolveExamIdFromResponse(
    response: unknown,
    fallbackExamId: number,
  ): number {
    if (typeof response === 'number' && response > 0) {
      return response;
    }

    if (response && typeof response === 'object') {
      const candidate = response as { exam_id?: unknown; id?: unknown };

      if (typeof candidate.exam_id === 'number' && candidate.exam_id > 0) {
        return candidate.exam_id;
      }

      if (typeof candidate.id === 'number' && candidate.id > 0) {
        return candidate.id;
      }
    }

    return fallbackExamId;
  }

  private cloneExam(exam: ExamDTO): ExamDTO {
    return JSON.parse(JSON.stringify(exam)) as ExamDTO;
  }

  private resetChangeRequest(): void {
    this.changeRequest.setValue('');
    this.changeRequest.markAsPristine();
    this.changeRequest.markAsUntouched();
  }

  private openConfirmDialog(config: Omit<ConfirmDialogState, 'open'>): void {
    this.confirmDialog = {
      open: true,
      ...config,
    };
  }

  private closeConfirmDialog(): void {
    this.confirmDialog = {
      open: false,
      action: null,
      title: 'Are you sure?',
      message: 'This action cannot be undone.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'default',
    };
  }

  private notifyApiError(error: unknown, fallbackMessage: string): void {
    const message = this.getErrorMessage(error, fallbackMessage);

    this.notificationService.show({
      type: 'error',
      title: 'Request Failed',
      message,
      autoCloseMs: 5000,
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object') {
      const candidate = error as {
        error?: { message?: string; error?: string };
      };

      return candidate.error?.message || candidate.error?.error || fallback;
    }

    return fallback;
  }
}
