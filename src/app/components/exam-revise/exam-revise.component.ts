import { Component, OnInit } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamDTO, Status } from '../../interfaces/exam.interface';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-revise',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-revise.component.html',
  styleUrl: './exam-revise.component.css'
})

export class ExamReviseComponent implements OnInit {
  exam: ExamDTO | null = null;
  private originalExam: ExamDTO | null = null;
  examId = 0;
  loading = true;
  saving = false;
  refining = false;
  showAiRequest = false;
  loadError = '';
  saveError = '';
  refineError = '';
  successMessage = '';

  readonly Status = Status;

  changeRequest = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly examService: ExamService,
    private readonly location: Location,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const examId = Number(idParam);
    this.examId = examId;

    if (!idParam || Number.isNaN(examId) || examId <= 0) {
      this.loading = false;
      this.loadError = 'Invalid exam id.';
      return;
    }

    this.loadExam(examId);
  }

  get totalItems(): number {
    return (
      this.exam?.exercises.reduce(
        (total, exercise) => total + exercise.items.length,
        0
      ) ?? 0
    );
  }

  get teacherDisplayName(): string {
    return this.exam?.teacher_full_name?.trim() || 'Not assigned';
  }

  get coordinatorDisplayName(): string {
    return this.exam?.coordinator_full_name?.trim() || 'Not assigned';
  }

  get createdAtLabel(): string {
    if (!this.exam?.date_created) {
      return '—';
    }

    const parsedDate = new Date(this.exam.date_created);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(this.exam.date_created);
    }

    return parsedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get isEditable(): boolean {
    return this.exam?.status === Status.ON_CORRECTION;
  }

  get modeLabel(): string {
    return this.isEditable ? 'Editable mode' : 'Read-only mode';
  }

  goBack(): void {
    this.examService.leaveCorrection(this.examId).subscribe({
      next: () => {
        this.location.back();
      }
    });
  }

  discardChanges(): void {
    if (!this.originalExam || !this.isEditable || this.refining) {
      return;
    }

    this.exam = this.cloneExam(this.originalExam);
    
    this.examService.leaveCorrection(this.examId).subscribe({
      next: () => {
        this.saveError = '';
        this.refineError = '';
        this.successMessage = '';
        this.location.back();
      }
    })
  }

  openAiRequest(): void {
    if (!this.isEditable || this.saving || this.refining) {
      return;
    }

    this.showAiRequest = true;
    this.refineError = '';
    this.saveError = '';
    this.successMessage = '';
  }

  cancelAiRequest(): void {
    if (this.refining) {
      return;
    }

    this.showAiRequest = false;
    this.refineError = '';
    this.changeRequest.setValue('');
    this.changeRequest.markAsPristine();
    this.changeRequest.markAsUntouched();
  }

  requestAiChanges(): void {
    if (!this.exam || !this.isEditable || this.saving || this.refining) {
      return;
    }

    const feedback = this.changeRequest.value.trim();

    if (!feedback) {
      this.changeRequest.markAsTouched();
      return;
    }

    this.refining = true;
    this.refineError = '';
    this.saveError = '';
    this.successMessage = '';

    this.examService.refineExam(this.exam.id, feedback).subscribe({
      next: (response) => {
        const updatedExamId = this.resolveExamIdFromResponse(response, this.exam!.id);

        this.examService.getFullExam(updatedExamId).subscribe({
          next: (updatedExam) => {
            this.exam = this.cloneExam(updatedExam);
            this.originalExam = this.cloneExam(updatedExam);
            this.refining = false;
            this.showAiRequest = false;
            this.changeRequest.setValue('');
            this.changeRequest.markAsPristine();
            this.changeRequest.markAsUntouched();
            this.successMessage = 'AI changes applied. Review the updated exam before saving.';
          },
          error: (error) => {
            this.refineError =
              error?.error?.message ||
              error?.error?.error ||
              'The updated exam could not be loaded.';
            this.refining = false;
          }
        });
      },
      error: (error) => {
        this.refineError =
          error?.error?.message ||
          error?.error?.error ||
          'The AI changes could not be requested.';
        this.refining = false;
      }
    });
  }

  onContextChange(event: Event): void {
    if (!this.exam || !this.isEditable) {
      return;
    }

    this.exam.context = this.readEditableContent(event);
  }

  onQuestionChange(
    exerciseIndex: number,
    itemIndex: number,
    event: Event
  ): void {
    if (!this.exam || !this.isEditable) {
      return;
    }

    this.exam.exercises[exerciseIndex].items[itemIndex].question =
      this.readEditableContent(event);
  }

  onAnswerChange(
    exerciseIndex: number,
    itemIndex: number,
    event: Event
  ): void {
    if (!this.exam || !this.isEditable) {
      return;
    }

    this.exam.exercises[exerciseIndex].items[itemIndex].answer =
      this.readEditableContent(event);
  }

  saveChanges(): void {
    if (!this.exam || !this.isEditable || this.saving || this.refining) {
      return;
    }

    if (!this.validateEditableContent()) {
      return;
    }

    this.saving = true;
    this.saveError = '';
    this.refineError = '';
    this.successMessage = '';

    this.examService.submitTeacherCorrection(this.exam.id, {
      context: this.exam.context,
      exercises: this.exam.exercises
    }).subscribe({
      next: () => {
        if (!this.exam) {
          this.saving = false;
          return;
        }

        this.exam.status = Status.PENDING_REVIEW;
        this.originalExam = this.cloneExam(this.exam);
        this.successMessage = 'Exam updated and sent back to review.';
        this.saving = false;
        this.router.navigate(['/exam']);
      },
      error: (error) => {
        this.saveError =
          error?.error?.message ||
          error?.error?.error ||
          'The exam could not be saved.';
        this.saving = false;
      }
    });
  }

  private loadExam(examId: number): void {
    this.loading = true;
    this.loadError = '';

    this.examService.getFullExam(examId).subscribe({
      next: (exam) => {
        this.exam = this.cloneExam(exam);
        this.originalExam = this.cloneExam(exam);
        this.loading = false;
      },
      error: (error) => {
        this.loadError =
          error?.error?.message ||
          error?.error?.error ||
          'The exam could not be loaded.';
        this.loading = false;
      }
    });
  }

  private validateEditableContent(): boolean {
    if (!this.exam) {
      this.saveError = 'Exam not loaded.';
      return false;
    }

    if (!this.exam.context.trim()) {
      this.saveError = 'Context cannot be empty.';
      return false;
    }

    for (let exerciseIndex = 0; exerciseIndex < this.exam.exercises.length; exerciseIndex += 1) {
      const exercise = this.exam.exercises[exerciseIndex];

      for (let itemIndex = 0; itemIndex < exercise.items.length; itemIndex += 1) {
        const item = exercise.items[itemIndex];

        if (!item.question.trim()) {
          this.saveError = `Question ${itemIndex + 1} in "${exercise.exercise_type}" cannot be empty.`;
          return false;
        }

        if (!item.answer.trim()) {
          this.saveError = `Answer ${itemIndex + 1} in "${exercise.exercise_type}" cannot be empty.`;
          return false;
        }
      }
    }

    return true;
  }

  private readEditableContent(event: Event): string {
    const target = event.target as HTMLElement | null;
    return (target?.innerText ?? '').replace(/\u00A0/g, ' ');
  }

  private resolveExamIdFromResponse(response: unknown, fallbackExamId: number): number {
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
}