import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamDTO, ExamItemDTO } from '../../interfaces/exam.interface';
import { UserType } from '../../interfaces/user.interface';

@Component({
  selector: 'app-view-exam',
  templateUrl: './view-exam.component.html',
  styleUrls: ['./view-exam.component.css'],
  imports: [ CommonModule]
})

export class ViewExamComponent implements OnInit {
  exam: ExamDTO | null = null;

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

    console.log('examService instance:', this.examService);
    console.log('typeof getFullExam:', typeof this.examService.getFullExam);

    console.log('examService injected =>', this.examService);
    console.log('keys =>', Object.keys(this.examService ?? {}));
    console.log('constructor =>', this.examService?.constructor?.name);

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

  get isStudent(): boolean {
    return this.userType === UserType.STUDENT;
  }

  get isTeacher(): boolean {
    return this.userType === UserType.TEACHER;
  }

  get isCoordinator(): boolean {
    return this.userType === UserType.COORDINATOR;
  }

  get showStatus(): boolean {
    return !this.isStudent && !!this.exam?.status;
  }

  get showNotesCard(): boolean {
    return !this.isStudent && !!this.exam?.notes?.trim();
  }

  get showActionsCard(): boolean {
    return !this.isStudent && (this.canRevise || this.canReview || this.canExport);
  }

  get canRevise(): boolean {
    return this.isTeacher && this.normalizeStatus(this.exam?.status) === 'pending correction';
  }

  get canReview(): boolean {
    return this.isCoordinator && this.normalizeStatus(this.exam?.status) === 'pending review';
  }

  get canExport(): boolean {
    return !this.isStudent && this.normalizeStatus(this.exam?.status) === 'accepted';
  }

  get pageEyebrow(): string {
    if (this.isStudent) {
      return 'Student exam view';
    }

    if (this.isCoordinator) {
      return 'Coordinator exam view';
    }

    return 'Teacher exam view';
  }

  get pageSubtitle(): string {
    if (this.isStudent) {
      return 'Review the full exam content together with your submitted answers and current results.';
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
    if (!this.exam?.date_created) {
      return 'Not available';
    }

    const parsedDate = new Date(this.exam.date_created);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(this.exam.date_created);
    }

    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parsedDate);
  }

  get totalItems(): number {
    if (!this.exam?.exercises?.length) {
      return 0;
    }

    return this.exam.exercises.reduce((total, exercise) => {
      return total + exercise.items.length;
    }, 0);
  }

  get scoreLabel(): string {
    return typeof this.exam?.score === 'number' ? `${this.exam.score}` : '—';
  }

  get expGainedLabel(): string {
    return typeof this.exam?.exp_gained === 'number' ? `${this.exam.exp_gained}` : '—';
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

  onExport(format: 'pdf' | 'docx'): void {
    this.exportMenuOpen = false;
    this.examService.exportExam(this.exam!.id, format).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-${this.exam!.id}.${format}`;
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