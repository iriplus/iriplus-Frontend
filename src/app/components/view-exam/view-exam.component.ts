import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamDTO, ExamItemDTO, ExamReviewDTO } from '../../interfaces/exam.interface';
import { UserType } from '../../interfaces/user.interface';

@Component({
  selector: 'app-view-exam',
  templateUrl: './view-exam.component.html',
  styleUrls: ['./view-exam.component.css'],
  imports: [ CommonModule]
})

export class ViewExamComponent implements OnInit {
  exam: ExamDTO | null = null;
  examReview: ExamReviewDTO | null = null;

  loading = true;
  error = '';
  exportMenuOpen = false;
  userType: UserType = UserType.STUDENT;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly examService: ExamService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadExam();
  }

  loadCurrentUser(): void {
    this.authService.loadMe().subscribe({
      next: (user) => {
        if (!user) {
          this.error = 'Unable to load current user.';
          return;
        }

        this.userType = this.normalizeUserType(user.type);
      },
      error: (err) => {
        console.error('Error loading current user:', err);
        this.error = 'Error loading current user.';
      }
    });
  }

  loadExam(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const examId = Number(idParam);

    if (!idParam || Number.isNaN(examId)) {
      this.loading = false;
      this.error = 'Invalid exam id.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.exam = null;
    this.examReview = null;

    const examStatus = history.state?.['examStatus'] as string | undefined;

    if (examStatus === 'Solved') {
      this.examService.getExamReview(examId).subscribe({
        next: (response: ExamReviewDTO) => {
          this.examReview = response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading exam review:', err);
          this.error = 'We could not load the exam correction. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.examService.getFullExam(examId).subscribe({
        next: (response: ExamDTO) => {
          this.exam = response;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading full exam:', err);
          this.error = 'We could not load the exam. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  get isStudent(): boolean {
    return this.userType === UserType.STUDENT;
  }

  get isTeacher(): boolean {
    return this.userType === UserType.TEACHER;
  }

  get isCoordinator(): boolean {
    return this.userType === UserType.COORDINATOR;
  }

  get isReviewMode(): boolean {
    return this.isStudent && !!this.examReview;
  }

  get showStatus(): boolean {
    return !this.isStudent && !!(this.exam?.status ?? this.examReview?.status);
  }

  get showNotesCard(): boolean {
    return !this.isStudent && !!this.exam?.notes?.trim();
  }

  get showActionsCard(): boolean {
    return !this.isStudent && (this.canRevise || this.canReview || this.canExport);
  }

  get canRevise(): boolean {
    const status = this.exam?.status ?? this.examReview?.status;
    return this.isTeacher && this.normalizeStatus(status) === 'pending correction';
  }

  get canReview(): boolean {
    const status = this.exam?.status ?? this.examReview?.status;
    return this.isCoordinator && this.normalizeStatus(status) === 'pending review';
  }

  get canExport(): boolean {
    const status = this.exam?.status ?? this.examReview?.status;
    return !this.isStudent && this.normalizeStatus(status) === 'accepted';
  }

  get pageEyebrow(): string {
    if (this.isStudent) {
      return this.isReviewMode ? 'Exam correction' : 'Student exam view';
    }

    if (this.isCoordinator) {
      return 'Coordinator exam view';
    }

    return 'Teacher exam view';
  }

  get pageSubtitle(): string {
    if (this.isStudent) {
      return this.isReviewMode
        ? 'Review your answers, the correct solutions, and feedback for each question.'
        : 'Review the full exam content together with your submitted answers and current results.';
    }

    if (this.isCoordinator) {
      return 'Review the exam content and check its current workflow status.';
    }

    return 'Review the exam content and check its current correction workflow.';
  }

  get teacherDisplayName(): string {
    return this.exam?.teacher_full_name?.trim() || 'Not assigned';
  }

  get coordinatorDisplayName(): string {
    return this.exam?.coordinator_full_name?.trim() || 'Not assigned';
  }

  get createdAtLabel(): string {
    const dateCreated = this.exam?.date_created ?? this.examReview?.date_created;
    if (!dateCreated) {
      return 'Not available';
    }

    const parsedDate = new Date(dateCreated);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(dateCreated);
    }

    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parsedDate);
  }

  get totalItems(): number {
    if (this.examReview?.exercises?.length) {
      return this.examReview.exercises.reduce((total, ex) => total + ex.items.length, 0);
    }
    if (!this.exam?.exercises?.length) {
      return 0;
    }
    return this.exam.exercises.reduce((total, exercise) => {
      return total + exercise.items.length;
    }, 0);
  }

  get scoreLabel(): string {
    if (typeof this.examReview?.score === 'number') return `${this.examReview.score}`;
    return typeof this.exam?.score === 'number' ? `${this.exam.score}` : '—';
  }

  get expGainedLabel(): string {
    const xp = this.examReview?.xp_gained ?? this.exam?.exp_gained;
    return typeof xp === 'number' ? `${xp}` : '—';
  }

  get answerLabel(): string {
    return this.isStudent ? 'Your answer' : 'Correct answer';
  }

  get answerPlaceholder(): string {
    return this.isStudent ? 'Not answered yet.' : 'No answer available.';
  }

  getDisplayedAnswer(item: ExamItemDTO): string {
    if (this.isStudent) {
      return item.student_answer?.trim() || '';
    }

    return item.answer?.trim() || '';
  }

  hasDisplayedAnswer(item: ExamItemDTO): boolean {
    return this.getDisplayedAnswer(item).length > 0;
  }

  toggleExportMenu(): void {
    this.exportMenuOpen = !this.exportMenuOpen;
  }

  onReviseExam(): void {
    console.log('Revise Exam clicked');
  }

  onReviewExam(): void {
    console.log('Review Exam clicked');
  }

  get exportExamId(): number {
    return (this.exam ?? this.examReview)!.id;
  }

  onExport(format: 'pdf' | 'docx'): void {
    this.exportMenuOpen = false;
    this.examService.exportExam(this.exportExamId, format).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-${this.exportExamId}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/exam']);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private normalizeStatus(status: string | undefined): string {
    return (status || '').trim().toLowerCase();
  }

  private normalizeUserType(value: unknown): UserType {
    const normalized = String(value ?? '').trim().toUpperCase();

    if (normalized === 'COORDINATOR') return UserType.COORDINATOR;
    if (normalized === 'TEACHER') return UserType.TEACHER;
    
    return UserType.STUDENT;
  }
}