import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserType } from '../../interfaces/user.interface';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Status } from '../../interfaces/exam.interface';

interface ExamListItem {
  id: number;
  context: string | null;
  class_description: string | null;
  teacher_full_name?: string | null;
  coordinator_full_name?: string | null;
  coordinator_id?: number | null;
  score?: number | null;
  exp_gained?: number | null;
  date_created: string;
  status: Status;
}

@Component({
  selector: 'app-exams.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})

export class ExamsComponent implements OnInit {
  readonly Status = Status;

  exams: ExamListItem[] = [];
  filteredExams: ExamListItem[] = [];
  paginatedExams: ExamListItem[] = [];
  currentPage = 1;
  pageSize = 10;
  errorMessage = '';

  selectedStatus = 'ALL';
  selectedClass = 'ALL';
  searchText = '';

  classes: { id: number; description: string }[] = [];

  currentUserId: number | null = null;
  currentUserType: UserType = UserType.STUDENT;

  constructor(
    private examService: ExamService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  get isCoordinator(): boolean {
    return this.currentUserType === UserType.COORDINATOR;
  }

  get isTeacher(): boolean {
    return this.currentUserType === UserType.TEACHER;
  }

  get isStudent(): boolean {
    return this.currentUserType === UserType.STUDENT;
  }

  get pageTitle(): string {
    if (this.isStudent) return 'My exams';
    if (this.isTeacher) return 'My exams';
    return 'Exam review';
  }

  get pageSubtitle(): string {
    if (this.isStudent) {
      return 'Review your completed exams, track your results, and start a new exam when you are ready.';
    }

    if (this.isTeacher) {
      return 'Track your submitted exams, check their status, and open them when needed.';
    }

    return 'Review, accept, or send for correction the exams created by the teachers.';
  }

  get searchPlaceholder(): string {
    if (this.isStudent) return 'Search by content, class or date...';
    if (this.isTeacher) return 'Search by content, coordinator or date...';
    return 'Search by teacher or date...';
  }

  get totalExams(): number {
    return this.exams.length;
  }

  get pendingExams(): number {
    return this.exams.filter(e => e.status === Status.PENDING_REVIEW).length;
  }

  get onReviewExams(): number {
    return this.exams.filter(e => e.status === Status.ON_REVIEW).length;
  }

  get pendingCorrectionExams(): number {
    return this.exams.filter(e => e.status === Status.PENDING_CORRECTION).length;
  }

  get acceptedExams(): number {
    return this.exams.filter(e => e.status === Status.ACCEPTED).length;
  }

  get averageScore(): number {
    const scoredExams = this.exams.filter(
      exam => typeof exam.score === 'number'
    );

    if (!scoredExams.length) return 0;

    const total = scoredExams.reduce((sum, exam) => sum + (exam.score || 0), 0);
    return Math.round(total / scoredExams.length);
  }

  get totalExpGained(): number {
    return this.exams.reduce((sum, exam) => sum + (exam.exp_gained || 0), 0);
  }

  get bestScore(): number {
    const scores = this.exams
      .map(exam => exam.score)
      .filter((score): score is number => typeof score === 'number');

    return scores.length ? Math.max(...scores) : 0;
  }

  get tableColspan(): number {
    if (this.isStudent) return 6;
    if (this.isTeacher) return 7;
    return 7;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredExams.length / this.pageSize));
  }

  private normalizeUserType(value: unknown): UserType {
    const normalized = String(value ?? '').trim().toUpperCase();

    if (normalized === 'COORDINATOR') return UserType.COORDINATOR;
    if (normalized === 'TEACHER') return UserType.TEACHER;
    
    return UserType.STUDENT;
  }

  loadCurrentUser(): void {
    this.authService.loadMe().subscribe({
      next: (user) => {
        if (!user) {
          this.errorMessage = 'Unable to load current user.';
          return;
        }

        this.currentUserId = user.id ?? null;
        this.currentUserType = this.normalizeUserType(user.type);

        this.loadExamsByRole();
      },
      error: (err) => {
        console.error('Error loading current user:', err);
        this.errorMessage = 'Error loading current user.';
      }
    });
  }

  loadExamsByRole(): void {
    this.errorMessage = '';
    this.selectedStatus = 'ALL';
    this.selectedClass = 'ALL';
    this.searchText = '';

    if (this.isCoordinator) {
      this.loadCoordinatorExams();
      return;
    }

    if (this.isTeacher) {
      this.loadTeacherExams();
      return;
    }

    if (this.isStudent) {
      this.loadStudentExams();
      return;
    }

    this.exams = [];
    this.filteredExams = [];
    this.paginatedExams = [];
    this.classes = [];
    this.errorMessage = 'Unsupported user type.';
    this.currentPage = 1;
  }

  loadCoordinatorExams(): void {
    this.examService.getAllExams().subscribe({
      next: (data) => {
        this.exams = data.map((exam: any) => ({
          id: exam.id,
          context: exam.context ?? null,
          class_description: exam.class_description ?? null,
          teacher_full_name: exam.teacher_full_name ?? null,
          coordinator_full_name: exam.coordinator_full_name ?? null,
          coordinator_id: exam.coordinator_id ?? null,
          score: exam.score ?? null,
          exp_gained: exam.exp_gained ?? null,
          date_created: exam.date_created,
          status: exam.status
        }));

        this.buildClasses();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading exams:', err);
        this.errorMessage = 'Error loading exams.';
      }
    });
  }

  loadTeacherExams(): void {
    this.examService.getTeacherExams().subscribe({
      next: (data) => {
        this.exams = data.map((exam: any) => ({
          id: exam.id,
          context: exam.context ?? null,
          class_description: exam.class_description ?? null,
          teacher_full_name: exam.teacher_full_name ?? null,
          coordinator_full_name: exam.coordinator_full_name ?? null,
          coordinator_id: exam.coordinator_id ?? null,
          score: exam.score ?? null,
          exp_gained: exam.exp_gained ?? null,
          date_created: exam.date_created,
          status: exam.status
        }));

        this.buildClasses();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading teacher exams:', err);
        this.errorMessage = 'Error loading exams.';
      }
    });
  }

  loadStudentExams(): void {
    this.examService.getStudentExams().subscribe({
      next: (data) => {
        this.exams = data.map((exam: any) => ({
          id: exam.id,
          context: exam.context ?? null,
          class_description: exam.class_description ?? null,
          teacher_full_name: exam.teacher_full_name ?? null,
          coordinator_full_name: exam.coordinator_full_name ?? null,
          coordinator_id: exam.coordinator_id ?? null,
          score: exam.score ?? null,
          exp_gained: exam.xp_gained ?? exam.exp_gained ?? null,
          date_created: exam.date_created,
          status: exam.status
        }));

        this.buildClasses();
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading student exams:', err);
        this.errorMessage = 'Error loading exams.';
      }
    });
  }

  buildClasses(): void {
    const uniqueClasses = [
      ...new Set(
        this.exams
          .map(exam => exam.class_description)
          .filter((value): value is string => !!value)
      )
    ];

    this.classes = uniqueClasses.map((description, index) => ({
      id: index + 1,
      description
    }));
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredExams = this.exams.filter(exam => {
      const statusMatch = this.isStudent
        ? true
        : this.selectedStatus === 'ALL' || exam.status === this.selectedStatus;

      const classMatch =
        !this.selectedClass ||
        this.selectedClass === 'ALL' ||
        (exam.class_description || '').toLowerCase() === this.selectedClass.toLowerCase();

      let searchMatch = true;

      if (search) {
        const content = (exam.context || '').toLowerCase();
        const teacher = (exam.teacher_full_name || '').toLowerCase();
        const coordinator = (exam.coordinator_full_name || 'unassigned').toLowerCase();
        const classDescription = (exam.class_description || '').toLowerCase();
        const score = String(exam.score ?? '');
        const exp = String(exam.exp_gained ?? '');

        const date = exam.date_created
          ? new Date(exam.date_created).toLocaleDateString('en-GB').toLowerCase()
          : '';

        if (this.isCoordinator) {
          searchMatch =
            content.includes(search) ||
            teacher.includes(search) ||
            date.includes(search);
        } else if (this.isTeacher) {
          searchMatch =
            content.includes(search) ||
            coordinator.includes(search) ||
            date.includes(search);
        } else if (this.isStudent) {
          searchMatch =
            content.includes(search) ||
            classDescription.includes(search) ||
            date.includes(search) ||
            score.includes(search) ||
            exp.includes(search);
        }
      }

      return statusMatch && classMatch && searchMatch;
    });

    this.currentPage = 1;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedExams = this.filteredExams.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  truncate(text: string | null | undefined, limit: number): string {
    if (!text) return 'No content';
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  }

  getCoordinatorInitial(name: string | null | undefined): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  getCoordinatorActionLabel(exam: ExamListItem): string {
    if (exam.status === Status.PENDING_REVIEW) {
      return 'Review Exam';
    }

    if (exam.status === Status.ON_REVIEW) {
      return 'Continue Review';
    }

    return 'View Exam';
  }

  getCoordinatorActionClass(exam: ExamListItem): string {
    if (exam.status === Status.PENDING_REVIEW || exam.status === Status.ON_REVIEW) {
      return 'btn-review';
    }

    return 'btn-view';
  }

  openCoordinatorExam(exam: ExamListItem): void {
    if (exam.status === Status.PENDING_REVIEW) {
      this.examService.setOnReview(exam.id).subscribe({
        next: () => {
          this.router.navigate(['/exam-review', exam.id]);
        },
        error: (err) => {
          console.error('Error setting exam on review:', err);
          this.errorMessage = 'Error opening exam review.';
        }
      });
      return;
    }

    if (exam.status === Status.ON_REVIEW) {
      this.router.navigate(['/exam-review', exam.id]);
      return;
    }

    this.router.navigate([`/view-exam/${exam.id}`]);
  }

  getTeacherActionLabel(exam: ExamListItem): string {
    if (exam.status === Status.PENDING_CORRECTION) {
      return 'Revise Exam';
    }

    if (exam.status === Status.ON_CORRECTION) {
      return 'Continue Revision';
    }

    return 'View Exam';
  }

  getTeacherActionClass(exam: ExamListItem): string {
    if (
      exam.status === Status.PENDING_CORRECTION ||
      exam.status === Status.ON_CORRECTION
    ) {
      return 'btn-revise';
    }

    return 'btn-view';
  }
  
  openTeacherExam(exam: ExamListItem): void {
    if (exam.status === Status.PENDING_CORRECTION) {
      this.examService.setOnCorrection(exam.id).subscribe({
        next: () => {
          this.router.navigate([`/exam-revise/${exam.id}`]);
        },
        error: (err) => {
          console.error('Error setting exam on correction:', err);
          this.errorMessage = 'Error opening exam revision.';
        }
      });
      return;
    }

    if (exam.status === Status.ON_CORRECTION) {
      this.router.navigate([`/exam-revise/${exam.id}`]);
      return;
    }

    this.router.navigate([`/view-exam/${exam.id}`]);
  }

  openStudentExam(exam: ExamListItem): void {
    this.router.navigate([`/view-exam/${exam.id}`], { state: { examStatus: exam.status } });
  }

  startNewExam(): void {
    this.router.navigate(['/generate-exam-student']);
  }

  getStatusClass(status: Status): string {
    switch (status) {
      case Status.PENDING_REVIEW:
        return 'status-pending';
      case Status.ON_REVIEW:
        return 'status-review';
      case Status.ACCEPTED:
        return 'status-accepted';
      case Status.PENDING_CORRECTION:
        return 'status-correction';
      case Status.ON_CORRECTION:
        return 'status-on-correction';
      case Status.TEST_EXAM:
        return 'status-test';
      case Status.STUDENT_EXAM:
        return 'status-student';
      default:
        return 'status-default';
    }
  }

  goToGenerateExam(): void {
    this.router.navigate(['/generate-exam']);
  }
}
