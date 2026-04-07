import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import {
  ExamDTO,
  ExamExerciseInstanceDTO,
  ExamItemDTO,
  SubmitStudentExamPayload,
  SubmitStudentExamResponse,
  Status
} from '../../interfaces/exam.interface';
import { NotificationService } from '../../services/notification.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogState
} from '../ui/confirm-dialog/confirm-dialog.component';
import { PendingChangesComponent } from '../../guards/can-deactivate.guard';

interface ResolveItemView {
  promptBefore: string;
  promptAfter: string;
  keyword: string | null;
  options: string[];
  studentAnswer: string;
}

interface ResolveExerciseView {
  examExerciseInstanceId: number;
  exercise_type: string;
  instructions: string;
  items: ResolveItemView[];
}

@Component({
  selector: 'app-exam-resolve',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './exam-resolve.component.html',
  styleUrl: './exam-resolve.component.css'
})
export class ExamResolveComponent implements OnInit, PendingChangesComponent {
  readonly Status = Status;

  studentName = '';
  exam: ExamDTO | null = null;
  examId: number | null = null;
  exerciseViews: ResolveExerciseView[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';

  private allowImmediateNavigation = false;
  private leaveConfirmation$?: Subject<boolean>;

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
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.studentName = [user.name, user.surname].filter(Boolean).join(' ') || 'Student';
    } else {
      this.authService.loadMe().subscribe((u) => {
        if (u) {
          this.studentName = [u.name, u.surname].filter(Boolean).join(' ') || 'Student';
        }
      });
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const examId = idParam ? parseInt(idParam, 10) : null;

    if (examId == null || isNaN(examId)) {
      this.errorMessage = 'Invalid exam ID.';
      this.loading = false;
      return;
    }

    this.examId = examId;

    this.examService.getFullExam(examId).subscribe({
      next: (exam) => {
        if (exam.status !== Status.STUDENT_EXAM) {
          this.errorMessage = "This exam is not available for resolution"
          this.loading = false;
          return;
        }
        this.exam = exam;
        const exercises = exam.exercises?.length
          ? exam.exercises
          : (exam as { generated_exercises?: ExamExerciseInstanceDTO[] }).generated_exercises ?? [];

        this.exerciseViews = exercises.map((exercise) => {
          const instanceId =
            exercise.exam_exercise_instance_id ??
            (exercise as { id?: number }).id ??
            0;

          return {
            examExerciseInstanceId: instanceId,
            exercise_type: exercise.exercise_type,
            instructions: exercise.instructions,
            items: exercise.items.map((item) => this.buildResolveItem(item))
          };
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error loading exam.';
        this.loading = false;
      }
    });
  }

  get totalItems(): number {
    return this.exerciseViews.reduce((acc, exercise) => acc + exercise.items.length, 0);
  }

  get answeredItems(): number {
    return this.exerciseViews.reduce(
      (acc, exercise) =>
        acc + exercise.items.filter((item) => item.studentAnswer.trim().length > 0).length,
      0
    );
  }

  get createdAtLabel(): string {
    if (!this.exam?.date_created) return '';

    const date =
      typeof this.exam.date_created === 'string'
        ? new Date(this.exam.date_created)
        : this.exam.date_created;

    if (Number.isNaN(date.getTime())) {
      return String(this.exam.date_created);
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBackToExams(): void {
    this.router.navigate(['/exam']);
  }

  cancel(): void {
    this.router.navigate(['/exam']);
  }

  finishExam(): void {
    if (this.submitting || this.examId == null || !this.exam) return;

    const payload: SubmitStudentExamPayload = {
      exercises: this.exerciseViews.map((ex) => ({
        exam_exercise_instance_id: ex.examExerciseInstanceId,
        items: ex.items.map((item) => ({
          student_answer: item.studentAnswer?.trim() ?? ''
        }))
      }))
    };

    this.errorMessage = '';
    this.submitting = true;

    this.examService.submitStudentExam(this.examId, payload).subscribe({
      next: (response: SubmitStudentExamResponse) => {
        const leveledUp =
          response.leveled_up ??
          (
            response.previous_level_id != null &&
            response.new_level_id != null &&
            response.previous_level_id !== response.new_level_id
          );
        let new_level_name = '';
        switch (response.new_level_id) {
          case 1:
            new_level_name = 'Unranked';
            break;
          case 2:
            new_level_name = 'Iron';
            break;
          case 3:
            new_level_name = 'Bronze';
            break;
          case 4:
            new_level_name = 'Silver';
            break;
          case 5:
            new_level_name = 'Gold';
            break;  
          case 6:
            new_level_name = 'Platinum';
            break;
          case 7:
            new_level_name = 'Sapphire';
            break;
          case 8:
            new_level_name = 'Ruby';
            break;
          case 9:
            new_level_name = 'Emerald';
            break;
          case 10:
            new_level_name = 'Amethyst';
            break;
          case 11:
            new_level_name = 'Pearl';
            break;
          case 12:
            new_level_name = 'Diamond';
            break;
          case 13:
            new_level_name = 'Obsidian';
            break;
          case 14:
            new_level_name = 'Master';
            break;
          default:
            new_level_name = 'Unranked';
        }
        this.notificationService.show({
          type: 'success',
          title: leveledUp ? 'Level up!' : 'Exam completed',
          message: leveledUp
            ? `You gained ${response.xp_gained} XP and advanced to level ${response.new_level_id}.`
            : `You gained ${response.xp_gained} XP.`,
          autoCloseMs: 5000
        });

        this.allowImmediateNavigation = true;
        this.router.navigate(['/exam']);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'Error submitting exam. Please try again.';

        this.notificationService.show({
          type: 'error',
          title: 'Exam submission failed',
          message: this.errorMessage,
          autoCloseMs: 5000
        });

        this.submitting = false;
      }
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.shouldWarnBeforeLeaving()) {
      return true;
    }

    this.leaveConfirmation$ = new Subject<boolean>();

    this.openConfirmDialog({
      action: 'leave-generate-exam',
      title: 'Leave exam?',
      message: 'If you leave now, this exam will be deleted and your progress will be lost. Are you sure you want to leave?',
      confirmText: 'Leave page',
      cancelText: 'Stay here',
      variant: 'danger',
    });

    return this.leaveConfirmation$.asObservable();
  }

  onConfirmDialogConfirmed(): void {
    const action = this.confirmDialog.action;
    this.closeConfirmDialog();

    if (action === 'leave-generate-exam') {
      this.confirmLeaveAndCleanup();
    }
  }

  onConfirmDialogCancelled(): void {
    const action = this.confirmDialog.action;
    this.closeConfirmDialog();

    if (action === 'leave-generate-exam') {
      this.leaveConfirmation$?.next(false);
      this.leaveConfirmation$?.complete();
      this.leaveConfirmation$ = undefined;
    }
  }

  private confirmLeaveAndCleanup(): void {
    if (!this.leaveConfirmation$) {
      return;
    }

    const examId = this.examId;

    const finishNavigation = (): void => {
      this.allowImmediateNavigation = true;
      this.leaveConfirmation$?.next(true);
      this.leaveConfirmation$?.complete();
      this.leaveConfirmation$ = undefined;
    };

    const cancelNavigation = (): void => {
      this.leaveConfirmation$?.next(false);
      this.leaveConfirmation$?.complete();
      this.leaveConfirmation$ = undefined;
    };

    if (examId == null || !this.exam || this.exam.status !== Status.STUDENT_EXAM) {
      finishNavigation();
      return;
    }

    this.examService.deleteExam(examId).subscribe({
      next: () => {
        this.exam = null;
        this.exerciseViews = [];
        finishNavigation();
      },
      error: () => {
        this.errorMessage = 'The exam could not be deleted.';
        cancelNavigation();
      }
    });
  }

  private shouldWarnBeforeLeaving(): boolean {
    if (this.allowImmediateNavigation) {
      return false;
    }

    if (!this.exam) {
      return false;
    }

    return this.exam.status === Status.STUDENT_EXAM && !this.submitting;
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

  @HostListener('window:beforeunload', ['$event'])
  handleBrowserUnload(event: BeforeUnloadEvent): void {
    if (this.shouldWarnBeforeLeaving()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private buildResolveItem(item: ExamItemDTO): ResolveItemView {
    const options = this.extractOptions(item.question);
    let cleanedQuestion = this.removeOptions(item.question).replace(/\(\s*\)\s*$/, '').trim();

    const keyword = this.extractKeyword(cleanedQuestion);

    if (keyword) {
      cleanedQuestion = cleanedQuestion.slice(0, cleanedQuestion.lastIndexOf(keyword)).trim();
    }

    const promptParts = this.splitAroundAnswer(cleanedQuestion, item.answer);

    return {
      promptBefore: promptParts.before,
      promptAfter: promptParts.after,
      keyword,
      options,
      studentAnswer: item.student_answer?.trim() ?? ''
    };
  }

  private extractOptions(question: string): string[] {
    const match = question.match(/\(([^)]+)\)\s*$/);
    if (!match) return [];
    return match[1].split('/').map((option) => option.trim()).filter(Boolean);
  }

  private removeOptions(question: string): string {
    return question.replace(/\(([^)]+)\)\s*$/, '').trim();
  }

  private extractKeyword(question: string): string | null {
    const match = question.match(/\b[A-Z][A-Z\s]+\b$/);
    return match ? match[0].trim() : null;
  }

  private splitAroundAnswer(question: string, answer: string): { before: string; after: string } {
    const normalizedQuestion = question ?? '';
    const normalizedAnswer = answer ?? '';
    const index = normalizedQuestion.indexOf(normalizedAnswer);

    if (index === -1) {
      return { before: normalizedQuestion, after: '' };
    }

    return {
      before: normalizedQuestion.slice(0, index).trim(),
      after: normalizedQuestion.slice(index + normalizedAnswer.length).trim()
    };
  }
}
