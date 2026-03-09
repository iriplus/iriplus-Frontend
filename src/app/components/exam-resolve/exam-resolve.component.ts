import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamDTO, ExamExerciseInstanceDTO, ExamItemDTO } from '../../interfaces/exam.interface';

interface ResolveItemView {
  promptBefore: string;
  promptAfter: string;
  keyword: string | null;
  options: string[];
  studentAnswer: string;
}

interface ResolveExerciseView {
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
  exerciseViews: ResolveExerciseView[] = [];
  loading = true;
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

    // #region agent log
    fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:subscribe-start',message:'getFullExam subscribe called',data:{examId},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    this.examService.getFullExam(examId).subscribe({
      next: (exam) => {
        // #region agent log
        fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:next-start',message:'getFullExam next received',data:{hasExercises:!!exam?.exercises?.length,hasGenerated:!!(exam as any)?.generated_exercises?.length,exerciseCount:exam?.exercises?.length ?? 0},hypothesisId:'H2',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        this.exam = exam;
        const exercises = exam.exercises?.length
          ? exam.exercises
          : (exam as { generated_exercises?: ExamExerciseInstanceDTO[] }).generated_exercises ?? [];
        // #region agent log
        fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:before-map',message:'before exercises map',data:{exerciseCount:exercises.length,firstItemHasAnswer:exercises[0]?.items?.[0]?.['answer']!==undefined},hypothesisId:'H1,H4',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        this.exerciseViews = exercises.map((exercise) => ({
          exercise_type: exercise.exercise_type,
          instructions: exercise.instructions,
          items: exercise.items.map((item) => this.buildResolveItem(item))
        }));
        this.loading = false;
        // #region agent log
        fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:next-done',message:'loading=false set',data:{},hypothesisId:'H5',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      },
      error: (err) => {
        // #region agent log
        fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:error',message:'getFullExam error',data:{err:''+err},hypothesisId:'H3',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
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
    this.router.navigate(['/exam']);
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
    // #region agent log
    if (answer == null || typeof answer !== 'string') { fetch('http://127.0.0.1:7616/ingest/78e6dadf-8d14-44be-a2f6-7fc5fe32ec43',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e3ca96'},body:JSON.stringify({sessionId:'e3ca96',location:'exam-resolve.component.ts:splitAroundAnswer',message:'answer null/undefined handled',data:{answerType:typeof answer},hypothesisId:'H1-fix',runId:'post-fix',timestamp:Date.now()})}).catch(()=>{}); }
    // #endregion
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
