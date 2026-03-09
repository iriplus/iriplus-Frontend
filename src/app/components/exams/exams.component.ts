import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';

type UserType = 'COORDINATOR' | 'TEACHER' | 'STUDENT' | null;

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
  status: string;
}

@Component({
  selector: 'app-exams.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})

export class ExamsComponent implements OnInit {
  exams: ExamListItem[] = [];
  filteredExams: ExamListItem[] = [];
  errorMessage = '';

  selectedStatus = 'ALL';
  selectedClass = 'ALL';
  searchText = '';

  classes: { id: number; description: string }[] = [];

  currentUserId: number | null = null;
  currentUserType: UserType = null;

  constructor(
    private examService: ExamService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  get isCoordinator(): boolean {
    return this.currentUserType === 'COORDINATOR';
  }

  get isTeacher(): boolean {
    return this.currentUserType === 'TEACHER';
  }

  get isStudent(): boolean {
    return this.currentUserType === 'STUDENT';
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
    return this.exams.filter(e => e.status === 'Pending Review').length;
  }

  get onReviewExams(): number {
    return this.exams.filter(e => e.status === 'On Review').length;
  }

  get pendingCorrectionExams(): number {
    return this.exams.filter(e => e.status === 'Pending Correction').length;
  }

  get acceptedExams(): number {
    return this.exams.filter(e => e.status === 'Accepted').length;
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

  private normalizeUserType(value: unknown): UserType {
    const normalized = String(value ?? '').trim().toUpperCase();

    if (normalized === 'COORDINATOR') return 'COORDINATOR';
    if (normalized === 'TEACHER') return 'TEACHER';
    if (normalized === 'STUDENT') return 'STUDENT';

    return null;
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
    this.classes = [];
    this.errorMessage = 'Unsupported user type.';
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
          exp_gained: exam.exp_gained ?? null,
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

  viewExam(examId: number): void {
    this.router.navigate([`/view-exam/${examId}`]);
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
        (exam.class_description || '')
          .toLowerCase()
          .includes(this.selectedClass.toLowerCase());

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
  }

  truncate(text: string | null | undefined, limit: number): string {
    if (!text) return 'No content';
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  }

  getCoordinatorInitial(name: string | null | undefined): string {
    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  getTeacherActionLabel(exam: ExamListItem): string {
    return exam.status === 'Pending Correction' ? 'Revise Exam' : 'View Exam';
  }

  assignExam(id: number): void {
    this.examService.sendToReview(id).subscribe({
      next: () => {
        this.router.navigate(['/exam-review', id]);
      },
      error: (err) => {
        console.error('Error assigning exam:', err);
        this.errorMessage = 'Error assigning exam.';
      }
    });
  }

  continueReview(id: number): void {
    this.router.navigate(['/exam-review', id]);
  }

  openTeacherExam(exam: ExamListItem): void {
    if (exam.status === 'Pending Correction') {
      this.router.navigate([`/exam-revise/${exam.id}`]);
      return;
    }
    this.router.navigate([`/view-exam/${exam.id}`]);
  }

  openStudentExam(exam: ExamListItem): void {
    this.router.navigate([`/view-exam/${exam.id}`]);
  }

  startNewExam(): void {
    this.router.navigate(['/generate-exam-student']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending Review':
        return 'status-pending';
      case 'On Review':
        return 'status-review';
      case 'Accepted':
        return 'status-accepted';
      case 'Pending Correction':
        return 'status-correction';
      case 'On Correction':
        return 'status-on-correction';
      case 'Test Exam':
        return 'status-test';
      case 'Student Exam':
        return 'status-student';
      default:
        return 'status-default';
    }
  }
}