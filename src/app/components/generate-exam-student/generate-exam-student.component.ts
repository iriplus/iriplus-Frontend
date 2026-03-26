import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import { ExerciseService } from '../../services/exercise.service';
import { AuthService } from '../../services/auth.service';
import { Exercise } from '../../interfaces/exercise.interface';
import {
  ConfirmDialogComponent,
  ConfirmDialogState
} from '../ui/confirm-dialog/confirm-dialog.component';
import { PendingChangesComponent } from '../../guards/can-deactivate.guard';

type Step = 'form' | 'loading';

@Component({
  selector: 'app-generate-exam-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './generate-exam-student.component.html',
  styleUrl: './generate-exam-student.component.css'
})
export class GenerateExamStudentComponent implements OnInit, PendingChangesComponent {
  step: Step = 'form';
  exerciseTypes: Exercise[] = [];
  classId: number | null = null;
  errorMessage = '';

  form: FormGroup;

  generatedExamId: number | null = null;
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

  private generationCancelled = false;
  private generationInProgress = false;

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private exerciseService: ExerciseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      exerciseTypeIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.authService.loadMe().subscribe({
      next: (res) => {
        if (res?.student_class_id) {
          this.classId = res.student_class_id;
        } else {
          this.errorMessage = 'You are not enrolled in a class. Please contact your coordinator.';
        }
      },
      error: () => {
        this.errorMessage = 'Error loading your profile.';
      }
    });

    this.exerciseService.getExercises().subscribe({
      next: (res) => {
        this.exerciseTypes = res;
      },
      error: () => {
        this.errorMessage = 'Error loading exercise types.';
      }
    });
  }

  onExerciseToggle(event: Event, id: number): void {
    const target = event.target as HTMLInputElement;
    const current = (this.form.value.exerciseTypeIds as number[]) || [];

    if (target.checked) {
      this.form.patchValue({ exerciseTypeIds: [...current, id] });
    } else {
      this.form.patchValue({
        exerciseTypeIds: current.filter((e: number) => e !== id)
      });
    }
  }

  generateExam(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  if (this.classId == null) {
    this.errorMessage = 'You are not enrolled in a class.';
    return;
  }

  this.errorMessage = '';
  this.step = 'loading';
  this.generatedExamId = null;
  this.allowImmediateNavigation = false;
  this.generationCancelled = false;
  this.generationInProgress = true;

  const exam_data = {
    class_id: this.classId,
    exercise_type_ids: this.form.value.exerciseTypeIds as number[]
  };

  this.examService.generateStudentExam(exam_data).subscribe({
    next: (res) => {
      this.generationInProgress = false;

      if (this.generationCancelled) {
        return;
      }

      this.generatedExamId = res.exam_id;
      this.allowImmediateNavigation = true;
      this.router.navigate(['/exam-resolve', res.exam_id]);
    },
    error: () => {
      this.generationInProgress = false;

      if (this.generationCancelled) {
        return;
      }

      this.errorMessage = 'Error generating exam. Please try again.';
      this.step = 'form';
    }
  });
}

  cancel(): void {
    this.router.navigate(['/exam']);
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (!this.shouldWarnBeforeLeaving()) {
      return true;
    }

    this.leaveConfirmation$ = new Subject<boolean>();

    this.openConfirmDialog({
      action: 'leave-generate-exam',
      title: 'Leave generated exam?',
      message: 'If you leave now, the generated exam may not be recoverable. Are you sure you want to leave?',
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

  this.generationCancelled = true;

  const examId = this.generatedExamId;

  const finishNavigation = (): void => {
    this.allowImmediateNavigation = true;
    this.leaveConfirmation$?.next(true);
    this.leaveConfirmation$?.complete();
    this.leaveConfirmation$ = undefined;
  };

  const cancelNavigation = (): void => {
    this.generationCancelled = false;
    this.leaveConfirmation$?.next(false);
    this.leaveConfirmation$?.complete();
    this.leaveConfirmation$ = undefined;
  };

  if (examId == null) {
    finishNavigation();
    return;
  }

  this.examService.deleteExam(examId).subscribe({
    next: () => {
      this.generatedExamId = null;
      this.step = 'form';
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

    return this.step === 'loading';
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
}