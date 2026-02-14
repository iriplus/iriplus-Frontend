import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { Class } from '../../interfaces/class.interface';
import { ExamDTO, ExamExerciseInstanceDTO, ExerciseTypeDTO } from '../../interfaces/exam.interface';
import { ExerciseService } from '../../services/exercise.service';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../interfaces/user.interface';


type Step = 'form' | 'loading' | 'preview' | 'edit';

@Component({
  selector: 'app-generate-exam',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './generate-exam.component.html',
  styleUrl: './generate-exam.component.css'
})

export class GenerateExamComponent implements OnInit {
  step: Step = 'form';
  showAnswers = false;

  classes: Class[] = [];
  exerciseTypes: ExerciseTypeDTO[] = [];
  generatedExam: ExamDTO | null = null;

  form: FormGroup;

  changeRequest: FormControl<string | null>;

  constructor(private fb: FormBuilder, private examService: ExamService, private authService: AuthService, private exerciseService: ExerciseService) {
    this.form = this.fb.group({
      classId: ['', Validators.required],
      context: ['', Validators.required],
      exerciseTypeIds: [[], Validators.required]
    });
    this.changeRequest = this.fb.control<string | null>('', Validators.required);
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.authService.loadMe().subscribe(
      res => {
        console.log(res)
        if (res?.type == UserType.TEACHER && res.teacher_classes) {
          this.classes = res.teacher_classes
        }
        console.log(this.classes)
      });
    this.exerciseService.getAllExercises().subscribe(
      res => this.exerciseTypes = res);
  }

  onExerciseToggle(event: any, id: number): void {
    const current = this.form.value.exerciseTypeIds as number[] || [];

    if(event.target.checked){
      this.form.patchValue({
        exerciseTypeIds: [...current, id]
      });
    } else {
      this.form.patchValue({
        exerciseTypeIds: current.filter(e => e !== id)
      });
    }
  }

  generateExam(): void {
    if (this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.step = 'loading';

    const exam_data = {
      class_id: this.form.value.classId,
      context: this.form.value.context,
      exercise_type_ids: this.form.value.exerciseTypeIds
    }

    console.log("Data del dexamn a cerar", exam_data)
    
    this.examService.generateExam(exam_data).subscribe({
      next: (res) => {
        console.log("Respuesta del generateExam", res)
        const exam_id = res.exam_id
        this.examService.getFullExam(exam_id).subscribe({
          next: (exam) => {
            console.log("Exam", exam)
            this.generatedExam = exam;
            this.step = 'preview'
          }
        })
      },
      error: (err) => {
        console.log(err)
        this.step = 'form';
      }
    });
  }

  discard(): void {
    if (!this.generatedExam) return;

    this.examService.deleteExam(this.generatedExam.id).subscribe(() => {
      this.resetFlow();
    });
  }

  changeSomething(): void {
    this.step = 'edit';
  }

  applyChanges(): void {
    if (!this.generatedExam) return;

    const changeRequestValue = (this.changeRequest.value ?? '').trim();
    if (!changeRequestValue) {
      this.changeRequest.markAsTouched();
      return;
    }

    this.step = 'loading';

    const changed_data = {
      exam_id: this.generatedExam.id,
      feedback: changeRequestValue
    }

    this.examService.refineExam(changed_data.exam_id, changed_data.feedback).subscribe({
      next: () => {
        this.examService.getFullExam(changed_data.exam_id).subscribe({
          next: (exam) => {
            console.log("Exam", exam)
            this.generatedExam = exam;
            this.step = 'preview'
          }
        })
      },
      error: (err) => {
        console.log(err)
        this.step = 'preview';
      }
    });
  }

  toggleAnswers(): void {
    this.showAnswers = !this.showAnswers;
  }

  parseJson(json: string): any {
    try {
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  sendToReview(): void {
    if (!this.generatedExam) return;

    this.examService.sendToReview(this.generatedExam.id).subscribe({
      next: () => {
        this.resetFlow();
      },
      error: () => {
        this.step = 'preview';
      }
    });
  }

  cancel(): void {
    this.resetFlow();
  }

  resetFlow(): void {
    this.step = 'form';
    this.generatedExam = null;
    this.showAnswers = false;
    this.form.reset();
    this.changeRequest.reset();
  }
}
