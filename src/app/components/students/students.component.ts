import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  imports: [CommonModule, FormsModule]
})

export class StudentsComponent implements OnInit {
  students: User[] = [];
  filteredStudents: User[] = [];
  searchTerm = '';

  loading = false;
  errorMessage = '';

  private brokenAvatars = new Set<number>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  isAvatarBroken(userId: number): boolean {
    return this.brokenAvatars.has(userId);
  }

  onAvatarError(userId: number): void {
    this.brokenAvatars.add(userId);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterStudents();
  }

  filterStudents(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredStudents = [...this.students];
      return;
    }

    this.filteredStudents = this.students.filter((s) => {
      const name = (s.name ?? '').toLowerCase();
      const surname = (s.surname ?? '').toLowerCase();
      const dni = (s.dni ?? '').toLowerCase();

      return name.includes(term) || surname.includes(term) || dni.includes(term);
    });
  }

  disableStudent(studentId: number): void {
    const confirmed = window.confirm('Disable this student?');
    if (!confirmed) return;

    // TODO: Wire this to your backend disable endpoint (soft delete).
    // Example idea:
    // this.userService.disableUser(studentId).subscribe(() => this.loadStudents());
    // For now, keep the UI action in place.
    console.warn('Disable student not implemented yet. studentId=', studentId);
  }

  private loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';

    // Robust behavior without relying on a front-end "current user role":
    // - If TEACHER: /student/my should succeed (200)
    // - If COORDINATOR: /student/my should be forbidden (403), then we fallback to /student
    this.userService.getMyStudents().subscribe({
      next: (students) => {
        this.setStudents(students ?? []);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.loadAllStudentsForCoordinator();
          return;
        }

        if (err.status === 404) {
          this.setStudents([]);
          return;
        }

        if (err.status === 501) {
          this.loading = false;
          this.errorMessage = 'My students endpoint is not implemented yet.';
          return;
        }

        this.loading = false;
        this.errorMessage = this.toUserErrorMessage(err);
      },
    });
  }

  private loadAllStudentsForCoordinator(): void {
    this.userService.getStudents().subscribe({
      next: (students) => {
        this.setStudents(students ?? []);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.setStudents([]);
          return;
        }

        this.loading = false;
        this.errorMessage = this.toUserErrorMessage(err);
      },
    });
  }

  private setStudents(students: User[]): void {
    this.students = students;
    this.filteredStudents = [...students];
    this.loading = false;
    this.filterStudents();
  }

  private toUserErrorMessage(err: HttpErrorResponse): string {
    const apiMessage = (err.error && (err.error.message || err.error.msg)) ? (err.error.message || err.error.msg) : '';
    if (apiMessage) return String(apiMessage);
    return 'An unexpected error occurred while loading students.';
  }
}