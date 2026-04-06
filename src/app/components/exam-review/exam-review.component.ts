import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { FormsModule } from '@angular/forms';
import { Status } from '../../interfaces/exam.interface';
import { ConfirmDialogComponent, ConfirmDialogState } from '../ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exam-review',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './exam-review.component.html',
  styleUrl: './exam-review.component.css',
})
export class ExamReviewComponent {
  readonly Status = Status;
  examId!: number;

  loading = true;
  errorMessage = '';

  exam: {
    id: number;
    title: string;
    description?: string;
    className: string;
    teacherName: string;
    date: string;
    status: Status;
    reviewerName?: string;
    notes?: string;
    coordinator_id?: number;
  } | null = null;

  sections: any[] = [];

  showAcceptModal = false;
  showCorrectionModal = false;
  showLaterModal = false;
  correctionNotes = '';

  confirmDialog: ConfirmDialogState = {
    open: false,
    action: null,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    if (!this.route) {
      console.error('ActivatedRoute is undefined!');
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');

    this.examId = Number(idParam);

    if (!this.examId) {
      return;
    }

    this.fetchFullExam();
  }

  backToList(): void {
    this.router.navigate(['/exam']);
  }

  openBackConfirm(): void {
    if (!this.hasUnsavedChanges()) {
      this.backToList();
      return;
    }

    this.confirmDialog = {
      open: true,
      action: 'leave-exam-review',
      title: 'Leave this page?',
      message: 'You have unsaved changes. If you go back now, those modifications will be lost.',
      confirmText: 'Leave page',
      cancelText: 'Stay here',
      variant: 'default',
    };
  }

  closeConfirmDialog(): void {
    this.confirmDialog = {
      ...this.confirmDialog,
      open: false,
      action: null,
    };
  }

  handleConfirm(): void {
    switch (this.confirmDialog.action) {
      case 'leave-exam-review':
        this.closeConfirmDialog();
        this.resetTransientState();
        this.backToList();
        break;
      default:
        this.closeConfirmDialog();
        break;
    }
  }

  fetchFullExam(): void {
    this.examService.getFullExam(this.examId).subscribe({
      next: (data) => {
        if (data.status !== Status.ON_REVIEW) {
          this.errorMessage = 'This exam is not currently on review';
          this.loading = false;
          return;
        }
        this.exam = this.mapHeader(data);
        this.sections = this.mapSections(data);
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error cargando el examen';
        this.loading = false;
      },
    });
  }

  openAccept(): void { 
    this.showAcceptModal = true; 
  }

  openCorrections(): void { 
    this.showCorrectionModal = true; 
  }

  openLater(): void {
    this.showLaterModal = true;
  }

  confirmAccept(): void {
    if (!this.examId) return;

    this.examService.acceptExam(this.examId).subscribe({
      next: () => {
        this.showAcceptModal = false;
        this.router.navigate(['/exam']);
      },
      error: (err) => {
        console.error('Error accepting exam:', err);
      }
    });
  }

  sendCorrection(): void {
    const notes = this.correctionNotes.trim();
    if (!notes || !this.exam?.id) return;

    this.examService.sendToCorrection(this.exam.id, notes).subscribe({
      next: () => {
        this.showCorrectionModal = false;
        this.correctionNotes = '';
        this.router.navigate(['/exam']);
      },
      error: (err) => {
        console.error('Error sending to correction:', err);
      }
    });
  }

  confirmLater(): void {
    this.showLaterModal = false;
    this.router.navigate(['/exam'])
  }

  private hasUnsavedChanges(): boolean {
    return this.correctionNotes.trim().length > 0;
  }

  private resetTransientState(): void {
    this.showAcceptModal = false;
    this.showCorrectionModal = false;
    this.showLaterModal = false;
    this.correctionNotes = '';
  }

  private mapHeader(full: any) {
    return {
      id: full.id,
      title: `Exam #${full.id}`,
      description: full.context ?? '',
      className: full.class_description ?? '',
      teacherName: full.teacher_full_name ?? '',
      date: full.date_created
        ? new Date(full.date_created).toLocaleDateString('es-AR')
        : '',
      status: full.status,
      reviewerName: full.coordinator_full_name ?? '',
      notes: full.notes ?? '',
      coordinator_id: full.coordinator_id ?? null,
    };
  }
    
  private mapSections(full: any): any[] {
    const list = full.exercises ?? [];
    return list.map((ex: any) => ({
      title: ex.exercise_type ?? 'Sección',
      type: ex.exercise_type ?? '',
      instructions: ex.instructions ?? '',
      questions: ex.items ?? [],
    }));
  }

  getOptionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }

  getStatusLabel(status: Status): string {
    switch (status) {
      case Status.PENDING_REVIEW:
        return 'Pending Review';
      case Status.ON_REVIEW:
        return 'On Review';
      case Status.ACCEPTED:
        return 'Accepted';
      case Status.PENDING_CORRECTION:
        return 'Pending Correction';
      default:
        return status;
    }
  }
}