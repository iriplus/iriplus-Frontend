import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { ExerciseService } from '../../services/exercise.service';
import { AuthService } from '../../services/auth.service';
import { Exercise } from '../../interfaces/exercise.interface';
import { PendingChangesComponent } from '../../guards/can-deactivate.guard';

type Step = 'form' | 'loading';

@Component({
  selector: 'app-generate-exam-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generate-exam-student.component.html',
  styleUrl: './generate-exam-student.component.css'
})
export class GenerateExamStudentComponent implements OnInit, PendingChangesComponent {
  step: Step = 'form';
  exerciseTypes: Exercise[] = [];
  classId: number | null = null;
  errorMessage = '';

  form: FormGroup;

  private allowImmediateNavigation = false;
  private generationCancelled = false;
  private generationInProgress = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly examService: ExamService,
    private readonly exerciseService: ExerciseService,
    private readonly authService: AuthService,
    private readonly router: Router
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
      if (!current.includes(id)) {
        this.form.patchValue({ exerciseTypeIds: [...current, id]})
      }
    } else {
      this.form.patchValue({
        exerciseTypeIds: current.filter((value: number) => value !== id)
      });
    }

    this.form.get('exerciseTypeIds')?.markAsTouched();
    this.form.get('exerciseTypeIds')?.updateValueAndValidity();
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

  canDeactivate(): boolean {
    return !this.shouldBlockLeaving();
  }

  private shouldBlockLeaving(): boolean {
    if (this.allowImmediateNavigation) {
      return false;
    }

    return this.step === 'loading' && this.generationInProgress;
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBrowserUnload(event: BeforeUnloadEvent): void {
    if (this.shouldBlockLeaving()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}