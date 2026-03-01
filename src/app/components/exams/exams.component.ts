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
      this.loadTeacherMockExams();
      return;
    }

    if (this.isStudent) {
      this.loadStudentMockExams();
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

  loadTeacherMockExams(): void {
    this.exams = [
      {
        id: 1,
        context: 'Unit 3 grammar and reading comprehension assessment',
        class_description: 'English 2A',
        coordinator_full_name: null,
        coordinator_id: null,
        date_created: '2026-02-26T09:15:00',
        status: 'Pending Review'
      },
      {
        id: 2,
        context: 'Past simple vs present perfect writing test',
        class_description: 'English 3B',
        coordinator_full_name: 'Emily Carter',
        coordinator_id: 5,
        date_created: '2026-02-24T14:40:00',
        status: 'On Review'
      },
      {
        id: 3,
        context: 'Listening exam about travel situations and airport vocabulary',
        class_description: 'English 1C',
        coordinator_full_name: 'Sophia Mitchell',
        coordinator_id: 7,
        date_created: '2026-02-22T11:05:00',
        status: 'Pending Correction'
      },
      {
        id: 4,
        context: 'Midterm test with mixed grammar and vocabulary exercises',
        class_description: 'English 4A',
        coordinator_full_name: 'Olivia Turner',
        coordinator_id: 8,
        date_created: '2026-02-20T16:20:00',
        status: 'Accepted'
      },
      {
        id: 5,
        context: 'Reading comprehension exam based on environmental issues',
        class_description: 'English 2B',
        coordinator_full_name: 'Emily Carter',
        coordinator_id: 5,
        date_created: '2026-02-18T10:10:00',
        status: 'On Correction'
      },
      {
        id: 6,
        context: 'Short diagnostic test for speaking support material',
        class_description: 'English 1A',
        coordinator_full_name: null,
        coordinator_id: null,
        date_created: '2026-02-16T08:30:00',
        status: 'Test Exam'
      }
    ];

    this.buildClasses();
    this.applyFilters();
  }

  loadStudentMockExams(): void {
    this.exams = [
      {
        id: 101,
        context: 'Grammar challenge: present perfect and simple past',
        class_description: 'English 2A',
        date_created: '2026-02-27T10:00:00',
        score: 87,
        exp_gained: 120,
        status: 'Completed'
      },
      {
        id: 102,
        context: 'Reading comprehension: technology and communication',
        class_description: 'English 2A',
        date_created: '2026-02-24T15:30:00',
        score: 93,
        exp_gained: 145,
        status: 'Completed'
      },
      {
        id: 103,
        context: 'Vocabulary quiz: travel and holidays',
        class_description: 'English 1C',
        date_created: '2026-02-22T09:45:00',
        score: 76,
        exp_gained: 90,
        status: 'Completed'
      },
      {
        id: 104,
        context: 'Listening practice exam: daily routines and habits',
        class_description: 'English 1C',
        date_created: '2026-02-20T11:20:00',
        score: 81,
        exp_gained: 105,
        status: 'Completed'
      },
      {
        id: 105,
        context: 'Mixed skills exam: writing, grammar and vocabulary',
        class_description: 'English 3B',
        date_created: '2026-02-18T13:10:00',
        score: 95,
        exp_gained: 160,
        status: 'Completed'
      },
      {
        id: 106,
        context: 'Reading and use of English: environment and science',
        class_description: 'English 3B',
        date_created: '2026-02-15T08:50:00',
        score: 89,
        exp_gained: 130,
        status: 'Completed'
      }
    ];

    this.buildClasses();
    this.applyFilters();
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
    console.log(this.getTeacherActionLabel(exam), exam.id);
  }

  openStudentExam(exam: ExamListItem): void {
    console.log('View Exam', exam.id);
  }

  startNewExam(): void {
    console.log('New Exam');
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