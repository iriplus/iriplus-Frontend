import { Component, OnInit } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ExamDTO, Status } from '../../interfaces/exam.interface';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-revise',
  imports: [CommonModule],
  templateUrl: './exam-revise.component.html',
  styleUrl: './exam-revise.component.css'
})

export class ExamReviseComponent implements OnInit {
  exam: ExamDTO | null = null;
  private originalExam: ExamDTO | null = null;
  examId = 0;
  loading = true;
  saving = false;
  loadError = '';
  saveError = '';
  successMessage = '';

  readonly Status = Status;

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
    if (!this.originalExam || !this.isEditable) {
      return;
    }

    this.exam = this.cloneExam(this.originalExam);
    this.saveError = '';
    this.successMessage = '';
    this.location.back();
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
    if (!this.exam || !this.isEditable || this.saving) {
      return;
    }

    if (!this.validateEditableContent()) {
      return;
    }

    this.saving = true;
    this.saveError = '';
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

  private cloneExam(exam: ExamDTO): ExamDTO {
    return JSON.parse(JSON.stringify(exam)) as ExamDTO;
  }
}