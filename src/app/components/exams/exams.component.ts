import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamDTO } from '../../interfaces/exam.interface';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { error } from 'console';


@Component({
  selector: 'app-exams.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.css'
})
export class ExamsComponent {


  exams: ExamDTO[] = [];
  filteredExams: ExamDTO[] = [];
  errorMessage = '';
  selectedStatus: string = 'ALL';
  classes: { id: number; description: string }[] = [];
  selectedClass: string = 'ALL';
  classSearch: string = '';
  searchText: string = '';
  currentUserId: number | null = null;


  constructor(
    private examService: ExamService,
    private router: Router,
    private authService: AuthService
  ) {
    console.log('ExamService:', this.examService);
  }


  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadExams();
  }

  loadCurrentUser(): void {
  this.authService.loadMe().subscribe(user => {
    if (!user) return;
    console.log('CURRENT USER:', user.id);
    this.currentUserId = user.id;
  });
}

loadExams(): void {
  this.examService.getAllExams().subscribe({
    next: (data) => {
      this.exams = data;
      this.filteredExams = this.exams;
      this.applyFilters();
    },
    error: (err) => {
      console.error('HTTP ERROR:', err);
      this.errorMessage = 'Error loading exams';
    }
  });
}

  assignExam(id: number): void {
    this.examService.sendToReview(id).subscribe(() => {
      //this.loadExams();
      this.router.navigate(['/exam-review', id]);
    })
  }

  continueReview(id: number): void {
  this.router.navigate(['/exam-review', id]);
}

  acceptExam(id: number): void {
    console.log('Accept exam', id);
  }


  rejectExam(id: number, notes: string): void {
    console.log('Reject exam', id, notes);
  }


  openRejectModal(exam: ExamDTO): void {
    const notes = prompt('Ingrese las notas para la profesora:');
    if (notes) {
      this.rejectExam(exam.id, notes);
    }
  }

  truncate(text: string | null | undefined, limit: number): string {
  if (!text) return 'Sin contexto';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
}
applyFilters(): void {
  const search = this.searchText?.toLowerCase().trim();

  this.filteredExams = this.exams.filter(exam => {

    const statusMatch =
      this.selectedStatus === 'ALL' ||
      exam.status === this.selectedStatus;

    const classMatch =
      !this.selectedClass ||
      this.selectedClass === 'ALL' ||
      (exam.class_description || '')
        .toLowerCase()
        .includes(this.selectedClass.toLowerCase());

    // ===== SEARCH: teacher or date =====
    let searchMatch = true;

    if (search) {
      const teacher = (exam.teacher_full_name || '').toLowerCase();

      const date = exam.date_created
        ? new Date(exam.date_created)
            .toLocaleDateString('es-AR')
            .toLowerCase()
        : '';

      searchMatch =
        teacher.includes(search) ||
        date.includes(search);
    }

    return statusMatch && classMatch && searchMatch;
  });
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