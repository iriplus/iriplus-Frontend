import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { TuitionService } from '../../services/tuition.service';
import { NotificationService } from '../../services/notification.service';
import { AnalyticsService } from '../../services/analytics.service';
import {
  TuitionDashboard,
  TuitionStudent,
} from '../../interfaces/analytics.interface';

interface StatusDistributionItem {
  label: string;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-tuitions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tuitions.component.html',
  styleUrls: ['./tuitions.component.css'],
})
export class TuitionsComponent implements OnInit {
  showUploadModal = false;
  selectedFile: File | null = null;
  isUploading = false;
  fileInputId = 'tuition-file-input';

  searchTerm = '';
  statusFilter: 'ALL' | 'upToDate' | 'delinquent' | 'noData' = 'ALL';

  readonly statusFilterOptions: { value: 'ALL' | 'upToDate' | 'delinquent' | 'noData'; label: string }[] = [
    { value: 'ALL', label: 'All statuses' },
    { value: 'upToDate', label: 'Up to date' },
    { value: 'delinquent', label: 'Delinquent' },
    { value: 'noData', label: 'No data' },
  ];

  tuitionData: TuitionDashboard | null = null;
  analyticsError: string | null = null;
  isLoadingAnalytics = false;

  constructor(
    private tuitionService: TuitionService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.loadTuitionAnalytics();
  }

  loadTuitionAnalytics(): void {
    this.isLoadingAnalytics = true;
    this.analyticsError = null;

    this.analyticsService
      .getTuitionAnalytics()
      .pipe(
        finalize(() => {
          this.isLoadingAnalytics = false;
        })
      )
      .subscribe({
        next: (response) => {
          const tuition = response.dashboard?.tuition;
          if (!tuition) {
            this.analyticsError = 'Tuition dashboard data is incomplete.';
            this.notificationService.show({
              type: 'error',
              title: 'Tuition analytics unavailable',
              message: this.analyticsError,
              autoCloseMs: 6000,
            });
            return;
          }
          this.tuitionData = tuition;
          this.analyticsError = null;
        },
        error: (err: HttpErrorResponse) => {
          const msg = this.toAnalyticsErrorMessage(err);
          this.analyticsError = msg;
          this.tuitionData = null;
          this.notificationService.show({
            type: 'error',
            title: 'Tuition analytics unavailable',
            message: msg,
            autoCloseMs: 6000,
          });
        },
      });
  }

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
        this.loadTuitionAnalytics();
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

  private toAnalyticsErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    const apiMessage = body?.message ?? body?.msg;
    if (apiMessage) return String(apiMessage);
    if (err.status === 403)
      return "You don't have permission to view tuition analytics.";
    if (err.status === 404)
      return 'Tuition analytics could not be found.';
    return 'An unexpected error occurred while loading tuition analytics.';
  }

  get delinquentList(): TuitionDashboard['studentsWithThreeOrMoreMonthsOverdue'] {
    return this.tuitionData?.studentsWithThreeOrMoreMonthsOverdue ?? [];
  }

  get statusDistribution(): StatusDistributionItem[] {
    const p = this.tuitionData?.summary?.percentages;
    if (!p) return [];
    return [
      { label: 'Up to date', percent: p.upToDate, color: 'var(--color-slate)' },
      { label: 'Delinquent', percent: p.delinquent, color: 'var(--color-danger)' },
      { label: 'No data', percent: p.noData, color: 'var(--color-olive)' },
    ];
  }

  get filteredTableData(): TuitionStudent[] {
    let students = this.tuitionData?.students ?? [];
    if (this.statusFilter !== 'ALL') {
      students = students.filter((s) => {
        const status = (s.status ?? '').toLowerCase().replace(/_/g, '');
        if (this.statusFilter === 'upToDate') return status === 'uptodate';
        if (this.statusFilter === 'delinquent') return status === 'delinquent';
        if (this.statusFilter === 'noData') return status === 'nodata';
        return true;
      });
    }
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        (s.name + ' ' + s.surname).toLowerCase().includes(term) ||
        s.dni.includes(term) ||
        s.lastPaidMonth.toLowerCase().includes(term) ||
        s.status.toLowerCase().includes(term.replace(/\s/g, ''))
    );
  }

  filterTable(): void {
    // Filtering is done via getter filteredTableData; this method is kept for (input) binding.
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'upToDate':
      case 'up_to_date':
        return 'Up to date';
      case 'delinquent':
        return 'Delinquent';
      case 'noData':
        return 'No data';
      default:
        return 'Other';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'upToDate':
      case 'up_to_date':
        return 'tuitions__badge--ok';
      case 'delinquent':
        return 'tuitions__badge--danger';
      case 'noData':
      default:
        return 'tuitions__badge--other';
    }
  }
}
