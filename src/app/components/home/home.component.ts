import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CoordinatorAnalyticsStats, HomeAnalyticsResponse, LeaderboardStudent, StudentCourseSummary, StudentDashboard, StudentLastExam, StudentProgress, WeeklyXpPoint, TeacherDashboard, TeacherCourseDashboard, TeacherPendingExam } from '../../interfaces/analytics.interface';
import { NotificationService } from '../../services/notification.service';
import { AnalyticsService } from '../../services/analytics.service';
import { UserType } from '../../interfaces/user.interface';
import { ExamService } from '../../services/exam.service';
import { Status } from '../../interfaces/exam.interface';

type LeaderboardScope = 'COURSE' | 'GLOBAL';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent implements OnInit {
  errorMessage = '';
  userType: UserType | null = null;

  isLoadingUser = false;
  isLoadingDashboard = false;

  studentDashboard: StudentDashboard | null = null;
  coordinatorStats: CoordinatorAnalyticsStats | null = null;
  teacherDashboard: TeacherDashboard | null = null;

  private readonly emptyStudentCourse: StudentCourseSummary = {
    name: 'No active class assigned',
    description:
      'You are not assigned to an active class yet. Please contact the institute staff if this looks incorrect.',
    teachers: ['Not assigned yet'],
    studentsEnrolled: 0,
    englishLevel: 'Not assigned',
  };

  private readonly emptyTeacherCourse: TeacherCourseDashboard = {
    id: 0,
    name: 'No active classes assigned',
    description:
      'You are not assigned to any active class yet.',
    teachers: [],
    studentsEnrolled: 0,
    englishLevel: 'Not assigned',
    leaderboard: [],
    weeklyXpByStudent: [],
    pendingCorrectionExams: [],
    pendingReviewExams: [],
  };

  private readonly emptyStudentProgress: StudentProgress = {
    currentLevel: 1,
    currentLevelName: 'Unranked',
    currentXp: 0,
    nextLevelXp: 0,
    nextLevelName: 'Bronze'
  };

  private readonly emptyWeeklyXp: WeeklyXpPoint[] = [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationService: NotificationService,
    private readonly examService: ExamService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadHome();
  }

  loadHome(): void {
    this.errorMessage = '';
    this.userType = null;
    this.studentDashboard = null;
    this.coordinatorStats = null;
    this.teacherDashboard = null;
    this.selectedTeacherCourseId = null;
    this.selectedTeacherChartStudents = [];
    this.teacherStudentMenuOpen = false;
    this.isLoadingUser = true;
    this.isLoadingDashboard = false;

    this.notificationService.clear();

    this.authService.loadMe().subscribe({
      next: (user) => {
        if (!user) {
          this.handleBlockingError('Unable to load your profile.');
          return;
        }

        this.userType = user.type;

        if (this.isCoordinator || this.isStudent || this.isTeacher) {
          this.loadHomeAnalytics();
          return;
        }

        this.isLoadingUser = false;
      },
      error: (err: unknown) => {
        console.error('Error loading current user:', err);
        this.handleBlockingError(
          this.getApiErrorMessage(err, 'Unable to load your profile.')
        );
      },
    });
  }

  private loadHomeAnalytics(): void {
    this.isLoadingDashboard = true;

    this.analyticsService
      .getHomeAnalytics()
      .pipe(
        finalize(() => {
          this.isLoadingUser = false;
          this.isLoadingDashboard = false;
        })
      )
      .subscribe({
        next: (response: HomeAnalyticsResponse) => {
          this.errorMessage = '';

          if (this.isCoordinator) {
            const coordinator = response.dashboard?.coordinator;

            if (!coordinator) {
              this.handleCoordinatorError(
                'Coordinator dashboard data is incomplete.'
              );
              return;
            }
            
            this.coordinatorStats = coordinator;
            return;
          }

          if (this.isStudent) {
            const student = response.dashboard?.student;

            if (!student) {
              this.handleStudentError(
                'Student dashboard data is incomplete.'
              );
              return;
            }

            this.studentDashboard = student;
            return;
          }
          if (this.isTeacher) {
            const teacher = response.dashboard?.teacher;

            if (!teacher) {
              this.handleTeacherError('Teacher dashboard data is incomplete.');
            return;
          }
          this.teacherDashboard = teacher;
          this.teacherStudentMenuOpen = false;

          const firstCourse = teacher.courses[0];
          this.selectedTeacherCourseId = firstCourse?.id ?? null;
          this.selectedTeacherChartStudents =
            firstCourse?.weeklyXpByStudent
              .slice(0, 3)
              .map(series => series.name) ?? [];
          return;
          }
        },
        error: (err: unknown) => {
          console.error('Error loading Home Analytics:', err);

          const message = this.getApiErrorMessage(
            err,
            'Unable to load the Home Dashboard.'
          );

          if (this.isCoordinator) {
            this.handleCoordinatorError(message);
            return;
          }

          if (this.isStudent) {
            this.handleStudentError(message);
            return;
          }

          if (this.isTeacher) {
            this.handleTeacherError(message);
            return;
          }

          this.handleBlockingError(message);
        },
      });
  }

  private handleBlockingError(message: string): void {
    this.errorMessage = message;
    this.userType = null;
    this.studentDashboard = null;
    this.coordinatorStats = null;
    this.teacherDashboard = null;
    this.selectedTeacherCourseId = null;
    this.selectedTeacherChartStudents = [];
    this.teacherStudentMenuOpen = false;
    this.isLoadingUser = false;
    this.isLoadingDashboard = false;

    this.notificationService.show({
      type: 'error',
      title: 'Home unavailable',
      message,
      autoCloseMs: 6000,
    });
  }

  private handleCoordinatorError(message: string): void {
    this.errorMessage = message;
    this.coordinatorStats = null;

    this.notificationService.show({
      type: 'error',
      title: 'Coordinator dashboard unavailable',
      message,
      autoCloseMs: 6000,
    });
  }

  private handleStudentError(message: string): void {
    this.errorMessage = message;
    this.studentDashboard = null;

    this.notificationService.show({
      type: 'error',
      title: 'Student dashboard unavailable',
      message,
      autoCloseMs: 6000,
    });
  }

  private handleTeacherError(message: string): void {
    this.errorMessage = message;
    this.teacherDashboard = null;

    this.notificationService.show({
      type: 'error',
      title: 'Teacher dashboard unavailable',
      message,
      autoCloseMs: 6000,
    });
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    const apiError = error as {
      error?: {
        message?: string;
        msg?: string;
      };
    };

    return apiError?.error?.message || apiError?.error?.msg || fallback;
  }

  get isPageLoading(): boolean {
    return this.isLoadingUser || this.isLoadingDashboard;
  }

  get showBlockingErrorState(): boolean {
    return !this.isPageLoading && !this.userType && !!this.errorMessage;
  }

  get showStudentErrorState(): boolean {
    return this.isStudent && !this.isPageLoading && !!this.errorMessage && !this.studentDashboard;
  }

  get showCoordinatorErrorState(): boolean {
    return this.isCoordinator && !this.isPageLoading && !!this.errorMessage && !this.coordinatorStats;
  }

  get showTeacherErrorState(): boolean {
  return this.isTeacher && !this.isPageLoading && !!this.errorMessage && !this.teacherDashboard;
}

  get teacherCourses(): TeacherCourseDashboard[] {
    return this.teacherDashboard?.courses ?? [];  
  }

  get hasTeacherCourses(): boolean {
    return this.teacherCourses.length > 0;
  }

  get homeSubtitle(): string {
    if (this.isStudent) {
      return 'Student overview with real platform analytics.'
    }
    
    if (this.isCoordinator) {
      return 'Coordinator overview with real platform analytics.';
    }

    if (this.isTeacher) {
      return 'Teacher overview with real platform analytics.';
    }

    return 'Loading your dashboard...';
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

  get studentCourse(): StudentCourseSummary {
    return this.studentDashboard?.courseSummary ?? this.emptyStudentCourse;
  }

  get courseLeaderboard(): LeaderboardStudent[] {
    return this.studentDashboard?.leaderboards.course ?? [];
  }

  get globalLeaderboard(): LeaderboardStudent[] {
    return this.studentDashboard?.leaderboards.global ?? [];
  }

  get weeklyXp(): WeeklyXpPoint[] {
    return this.studentDashboard?.weeklyXp ?? this.emptyWeeklyXp;
  }

  get studentProgress(): StudentProgress {
    return this.studentDashboard?.progress ?? this.emptyStudentProgress;
  }

  get lastExams(): StudentLastExam[] {
    return this.studentDashboard?.lastExams ?? [];
  }

  get shouldScrollStudentLeaderboard(): boolean {
    return this.visibleLeaderboard.length > 5;
  }

  get shouldScrollTeacherLeaderboard(): boolean {
    return this.selectedTeacherCourse.leaderboard.length > 5;
  }

  private readonly chartWidth = 360;
  private readonly chartHeight = 220;
  private readonly chartLeft = 36;
  private readonly chartRight = 20;
  private readonly chartTop = 18;
  private readonly chartBottom = 34;

  leaderboardScope: LeaderboardScope = 'COURSE';

  viewExam(examId: number): void {
    this.router.navigate([`/view-exam/${examId}`]);
  }

  setLeaderboardScope(scope: LeaderboardScope): void {
    this.leaderboardScope = scope;
  }

  get visibleLeaderboard(): LeaderboardStudent[] {
    return this.leaderboardScope === 'COURSE'
      ? this.courseLeaderboard
      : this.globalLeaderboard;
  }

  get xpToNextLevel(): number {
    return Math.max(
      this.studentProgress.nextLevelXp - this.studentProgress.currentXp,
      0
    );
  }

  get levelProgressPercent(): number {
    if (this.studentProgress.nextLevelXp <= 0) {
      return 0;
    }

    return Math.min(
      (this.studentProgress.currentXp / this.studentProgress.nextLevelXp) * 100,
      100
    );
  }

  get weeklyXpTotal(): number {
    return this.weeklyXp.reduce((total, item) => total + item.value, 0);
  }

  get bestXpDay(): WeeklyXpPoint {
    if (this.weeklyXp.length === 0) {
      return { label: '-', value: 0 };
    }

    return this.weeklyXp.reduce((best, current) =>
      current.value > best.value ? current : best
    );
  }

  get chartMaxValue(): number {
    return Math.max(...this.weeklyXp.map(point => point.value), 1);
  }

  get chartYAxisTicks(): Array<{ value: number; y: number }> {
    const steps = 4;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;
    const rawMax = Math.max(...this.weeklyXp.map(point => point.value), 0);

    if (rawMax === 0) {
      return Array.from({ length: steps + 1 }, (_, index) => {
        const ratio = index / steps;
        const y = this.chartTop + ratio * drawableHeight;

        return { value: 0, y };
      });
   }

    return Array.from({ length: steps + 1 }, (_, index) => {
      const ratio = index / steps;
      const y = this.chartTop + ratio * drawableHeight;
      const value = Math.round(this.chartMaxValue * (1 - ratio));

      return { value, y };
    });
  }

  get chartGridLines(): number[] {
    return this.chartYAxisTicks.map(tick => tick.y);
  }

  get teacherChartMaxValue(): number {
    const allValues = this.selectedTeacherCourse.weeklyXpByStudent.reduce<number[]>(
      (acc, series) => {
        acc.push(...series.values.map(point => point.value));
        return acc;
      },
      []
    );

    return Math.max(...allValues, 1);
  }

  get teacherChartYAxisTicks(): Array<{ value: number; y: number }> {
    const steps = 4;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;

    const allValues = this.selectedTeacherCourse.weeklyXpByStudent.reduce<number[]>(
      (acc, series) => {
        acc.push(...series.values.map(point => point.value));
        return acc;
      },
      []
    );

    const rawMax = Math.max(...allValues, 0);

    if (rawMax === 0) {
      return Array.from({ length: steps + 1 }, (_, index) => {
        const ratio = index / steps;
        const y = this.chartTop + ratio * drawableHeight;

        return { value: 0, y };
      });
    }

    return Array.from({ length: steps + 1 }, (_, index) => {
      const ratio = index / steps;
      const y = this.chartTop + ratio * drawableHeight;
      const value = Math.round(this.teacherChartMaxValue * (1 - ratio));

      return { value, y };
    });
  }

  get teacherChartGridLines(): number[] {
    return this.teacherChartYAxisTicks.map(tick => tick.y);
  }

  get chartDots(): Array<{ x: number; y: number; label: string; value: number }> {
    const maxValue = this.chartMaxValue;
    const drawableWidth = this.chartWidth - this.chartLeft - this.chartRight;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;

    return this.weeklyXp.map((point, index) => {
      const x =
        this.chartLeft +
        (index * drawableWidth) / Math.max(this.weeklyXp.length - 1, 1);

      const y =
        this.chartTop +
        drawableHeight -
        (point.value / maxValue) * drawableHeight;

      return {
        x,
        y,
        label: point.label,
        value: point.value
      };
    });
  }

  get chartPoints(): string {
    return this.chartDots.map(point => `${point.x},${point.y}`).join(' ');
  }

  getContextPreview(context: string, maxLength: number = 110): string {
    if (context.length <= maxLength) {
      return context;
    }

    return `${context.slice(0, maxLength).trim()}...`;
  }

selectedTeacherCourseId: number | null = null;
teacherStudentMenuOpen = false;
selectedTeacherChartStudents: string[] = [];

  readonly teacherSeriesPalette: string[] = [
    '#27532f',
    '#C97C5D',
    '#9EB28F',
    '#A3A191',
    '#f0ac91'
  ];


  get selectedTeacherCourse(): TeacherCourseDashboard {
    return (
      this.teacherCourses.find(course => course.id === this.selectedTeacherCourseId) ??
      this.teacherCourses[0] ??
      this.emptyTeacherCourse
    );
  }

  setSelectedTeacherCourse(courseId: number): void {
    const course = this.teacherCourses.find(item => item.id === courseId);

    if (!course) {
      return;
    }
    this.selectedTeacherCourseId = courseId;
    this.teacherStudentMenuOpen = false;

    this.selectedTeacherChartStudents = this.selectedTeacherCourse.weeklyXpByStudent
      .slice(0, 3)
      .map(series => series.name);
  }

  toggleTeacherStudentMenu(): void {
    this.teacherStudentMenuOpen = !this.teacherStudentMenuOpen;
  }

  isTeacherStudentSelected(studentName: string): boolean {
    return this.selectedTeacherChartStudents.includes(studentName);
  }

  toggleTeacherChartStudent(studentName: string): void {
    const alreadySelected = this.isTeacherStudentSelected(studentName);

    if (alreadySelected) {
      if (this.selectedTeacherChartStudents.length === 1) {
        return;
      }

      this.selectedTeacherChartStudents = this.selectedTeacherChartStudents.filter(
        name => name !== studentName
      );

      return;
    }

    this.selectedTeacherChartStudents = [
      ...this.selectedTeacherChartStudents,
      studentName
    ];
  }

  openTeacherExam(examId: number, mode: 'correction' | 'review'): void {
    if (mode === 'correction') {
      this.examService.setOnCorrection(examId).subscribe({
        next: () => {
          this.router.navigate([`/exam-revise/${examId}`]);
        },
        error: (err: unknown) => {
          console.error('Error setting exam on correction:', err);
          this.notificationService.show({
            type: 'error',
            title: 'Unable to open exam',
            message: this.getApiErrorMessage(
              err,
              'Unable to open the exam for correction.'
            ),
            autoCloseMs: 6000,
          });
        },
      });
      return;
    }

    this.router.navigate([`/view-exam/${examId}`]);
  }

  get pendingCorrectionExams(): TeacherPendingExam[] {
    return this.filterTeacherPendingExams(
      this.selectedTeacherCourse.pendingCorrectionExams,
      Status.PENDING_CORRECTION
    );
  }

  get pendingReviewExams(): TeacherPendingExam[] {
    return this.filterTeacherPendingExams(
      this.selectedTeacherCourse.pendingReviewExams,
      Status.PENDING_REVIEW
    );
  }

  private filterTeacherPendingExams(
    exams: TeacherPendingExam[],
    status: Status
  ): TeacherPendingExam[] {
    return exams.filter(exam => !exam.status || exam.status === status);
  }

  get teacherSelectedWeeklySeries(): Array<{
    name: string;
    color: string;
    points: Array<{ x: number; y: number; label: string; value: number }>;
    polyline: string;
  }> {
    return this.selectedTeacherCourse.weeklyXpByStudent
      .filter(series => this.selectedTeacherChartStudents.includes(series.name))
      .map((series, index) => ({
        name: series.name,
        color: this.teacherSeriesPalette[index % this.teacherSeriesPalette.length],
        points: this.buildTeacherChartDots(series.values),
        polyline: this.buildTeacherChartDots(series.values)
          .map(point => `${point.x},${point.y}`)
          .join(' ')
      }));
  }

  get teacherChartXAxis(): Array<{ x: number; y: number; label: string; value: number }> {
    return this.teacherSelectedWeeklySeries[0]?.points ?? [];
  }

  private buildTeacherChartDots(
    points: WeeklyXpPoint[]
  ): Array<{ x: number; y: number; label: string; value: number }> {
    const allValues = this.selectedTeacherCourse.weeklyXpByStudent.reduce<number[]>(
      (acc, series) => {
        acc.push(...series.values.map(point => point.value));
        return acc;
      },
      []
    );

    const maxValue = this.teacherChartMaxValue;

    const drawableWidth = this.chartWidth - this.chartLeft - this.chartRight;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;

    return points.map((point, index) => {
      const x =
        this.chartLeft +
        (index * drawableWidth) / Math.max(points.length - 1, 1);

      const y =
        this.chartTop +
        drawableHeight -
        (point.value / maxValue) * drawableHeight;

      return {
        x,
        y,
        label: point.label,
        value: point.value
      };
    });
  }
}
