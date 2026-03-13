import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TuitionService } from '../../services/tuition.service';
import { NotificationService } from '../../services/notification.service';

export interface MockTuitionStudent {
  name: string;
  dni: string;
  status: 'up_to_date' | 'delinquent' | 'other';
  lastPaidMonth: string;
}

const MOCK_DELINQUENT_LIST: { name: string; dni: string; monthsOverdue: number }[] = [
  { name: 'Ana García', dni: '30123456', monthsOverdue: 4 },
  { name: 'Carlos López', dni: '31234567', monthsOverdue: 5 },
  { name: 'María Fernández', dni: '32345678', monthsOverdue: 3 },
  { name: 'Juan Pérez', dni: '33456789', monthsOverdue: 6 },
  { name: 'Laura Martínez', dni: '34567890', monthsOverdue: 4 },
];

const MOCK_STATUS_DISTRIBUTION = [
  { label: 'Up to date', percent: 70, color: 'var(--color-slate)' },
  { label: 'Delinquent', percent: 20, color: 'var(--color-danger)' },
  { label: 'Other', percent: 10, color: 'var(--color-olive)' },
];

const MOCK_TUITION_TABLE: MockTuitionStudent[] = [
  { name: 'Ana García', dni: '30123456', status: 'delinquent', lastPaidMonth: '2024-10' },
  { name: 'Carlos López', dni: '31234567', status: 'delinquent', lastPaidMonth: '2024-09' },
  { name: 'María Fernández', dni: '32345678', status: 'delinquent', lastPaidMonth: '2024-11' },
  { name: 'Laura Martínez', dni: '34567890', status: 'up_to_date', lastPaidMonth: '2025-03' },
  { name: 'Pedro Sánchez', dni: '35678901', status: 'up_to_date', lastPaidMonth: '2025-03' },
  { name: 'Sofía Ruiz', dni: '36789012', status: 'other', lastPaidMonth: '2025-01' },
  { name: 'Diego Torres', dni: '37890123', status: 'up_to_date', lastPaidMonth: '2025-02' },
  { name: 'Valentina Morales', dni: '38901234', status: 'delinquent', lastPaidMonth: '2024-08' },
];

@Component({
  selector: 'app-tuitions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tuitions.component.html',
  styleUrls: ['./tuitions.component.css'],
})
export class TuitionsComponent {
  showUploadModal = false;
  selectedFile: File | null = null;
  isUploading = false;
  fileInputId = 'tuition-file-input';

  searchTerm = '';

  mockDelinquentList = MOCK_DELINQUENT_LIST;
  mockStatusDistribution = MOCK_STATUS_DISTRIBUTION;
  mockTableData = [...MOCK_TUITION_TABLE];
  filteredTableData: MockTuitionStudent[] = [...MOCK_TUITION_TABLE];

  constructor(
    private tuitionService: TuitionService,
    private notificationService: NotificationService
  ) {}

  openUploadModal(): void {
    this.showUploadModal = true;
    this.selectedFile = null;
    this.isUploading = false;
    const input = document.getElementById(this.fileInputId) as HTMLInputElement;
    if (input) input.value = '';
  }

  closeUploadModal(): void {
    if (!this.isUploading) {
      this.showUploadModal = false;
      this.selectedFile = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = file ?? null;
  }

  submitUpload(): void {
    if (!this.selectedFile) {
      this.notificationService.show({
        type: 'warning',
        message: 'Please select a file.',
        autoCloseMs: 5000,
      });
      return;
    }

    this.isUploading = true;
    this.tuitionService.uploadTuitions(this.selectedFile).subscribe({
      next: (res) => {
        this.notificationService.show({
          type: 'success',
          message: `${res.message} ${res.updated_count} student(s) updated.`,
          autoCloseMs: 5000,
        });
        this.closeUploadModal();
        this.showUploadModal = false;
        this.selectedFile = null;
        this.isUploading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isUploading = false;
        const msg = this.toUploadErrorMessage(err);
        this.notificationService.show({
          type: 'error',
          message: msg,
          autoCloseMs: 8000,
        });
      },
    });
  }

  private toUploadErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    let msg = body?.message ? String(body.message) : '';

    if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
      const preview = body.errors.slice(0, 5).join(' ');
      const more = body.errors.length > 5 ? ` (${body.errors.length - 5} more)` : '';
      msg = msg ? `${msg} ${preview}${more}` : preview + more;
    }
    if (body?.invalid_dnis && Array.isArray(body.invalid_dnis)) {
      const dnis = body.invalid_dnis.slice(0, 10).join(', ');
      const more = body.invalid_dnis.length > 10 ? `... (${body.invalid_dnis.length} total)` : '';
      msg = msg ? `${msg} Invalid DNIs: ${dnis}${more}` : `Invalid DNIs: ${dnis}${more}`;
    }

    if (msg) return msg;
    if (err.status === 403) return "You don't have permission to perform this action.";
    return 'An unexpected error occurred. Please try again.';
  }

  filterTable(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTableData = [...this.mockTableData];
      return;
    }
    this.filteredTableData = this.mockTableData.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.dni.includes(term) ||
        s.lastPaidMonth.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term.replace(/\s/g, '_'))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredTableData = [...this.mockTableData];
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'up_to_date':
        return 'Up to date';
      case 'delinquent':
        return 'Delinquent';
      default:
        return 'Other';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'up_to_date':
        return 'tuitions__badge--ok';
      case 'delinquent':
        return 'tuitions__badge--danger';
      default:
        return 'tuitions__badge--other';
    }
  }
}
