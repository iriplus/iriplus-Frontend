import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExamService } from '../../services/exam.service';
import { ExerciseService } from '../../services/exercise.service';
import { AuthService } from '../../services/auth.service';
import { Exercise } from '../../interfaces/exercise.interface';

type Step = 'form' | 'loading';

@Component({
  selector: 'app-generate-exam-student',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generate-exam-student.component.html',
  styleUrl: './generate-exam-student.component.css'
})
export class GenerateExamStudentComponent implements OnInit {
  step: Step = 'form';
  exerciseTypes: Exercise[] = [];
  classId: number | null = null;
  errorMessage = '';

  form: FormGroup;

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
          this.errorMessage = 'You are not enrolled in a course. Please contact your coordinator.';
        }
      },
      error: () => {
        this.errorMessage = 'Error loading your profile.';
      }
    });

    this.exerciseService.getExercises().subscribe({
      next: (res) => this.exerciseTypes = res,
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
      this.form.patchValue({ exerciseTypeIds: current.filter((e: number) => e !== id) });
    }
  }

  generateExam(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.classId == null) {
      this.errorMessage = 'You are not enrolled in a course.';
      return;
    }

    this.errorMessage = '';
    this.step = 'loading';

    const exam_data = {
      class_id: this.classId,
      exercise_type_ids: this.form.value.exerciseTypeIds as number[]
    };

    this.examService.generateStudentExam(exam_data).subscribe({
      next: (res) => {
        const exam_id = res.exam_id;
        this.router.navigate(['/exam-resolve', exam_id]);
      },
      error: () => {
        this.errorMessage = 'Error generating exam. Please try again.';
        this.step = 'form';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/exam']);
  }
}
