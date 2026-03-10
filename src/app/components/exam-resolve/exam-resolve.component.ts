import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import {
  ExamDTO,
  ExamExerciseInstanceDTO,
  ExamItemDTO,
  SubmitStudentExamPayload
} from '../../interfaces/exam.interface';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-resolve.component.html',
  styleUrl: './exam-resolve.component.css'
})
export class ExamResolveComponent implements OnInit {
  studentName = '';
  exam: ExamDTO | null = null;
  examId: number | null = null;
  exerciseViews: ResolveExerciseView[] = [];
  loading = true;
  submitting = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
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
      next: () => {
        this.router.navigate(['/exam']);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'Error submitting exam. Please try again.';
        this.submitting = false;
      }
    });
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

  private splitAroundAnswer(question: string, answer: string): { before: string; after: string } {
    if (answer == null || typeof answer !== 'string') {
      return { before: question, after: '' };
    }
    const escapedAnswer = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedAnswer, 'i');
    const match = question.match(regex);

    if (!match || match.index === undefined) {
      return {
        before: question,
        after: ''
      };
    }

    return {
      before: question.slice(0, match.index).trim(),
      after: question.slice(match.index + match[0].length).trim()
    };
  }

  private extractKeyword(question: string): string | null {
    const match = question.match(/\b([A-Z][A-Z-]*)\b\s*$/);
    return match ? match[1] : null;
  }

  private removeOptions(question: string): string {
    return question.replace(/\([A-Z]\)\s*[^()]+(?=(\s*\([A-Z]\))|$)/g, '').trim();
  }

  private extractOptions(question: string): string[] {
    const matches = [...question.matchAll(/\([A-Z]\)\s*([^()]+?)(?=\s*\([A-Z]\)|$)/g)];
    return matches.map((match) => match[1].trim());
  }
}
