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

  canDisableStudents = true;

  selectedClassId: string = 'all';
  selectedLevelId: string = 'all';

  classOptions: Array<{ id: number; label: string }> = [];
  levelOptions: Array<{ id: number; label: string }> = [];

  hasUnassignedClass = false;
  hasUnassignedLevel = false;

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

    this.filteredStudents = this.students.filter((s) => {
      // text search
      if (term) {
        const name = (s.name ?? '').toLowerCase();
        const surname = (s.surname ?? '').toLowerCase();
        const dni = (s.dni ?? '').toLowerCase();

        const matchesText = name.includes(term) || surname.includes(term) || dni.includes(term);
        if (!matchesText) return false;
      }

      // class filter
      if (this.selectedClassId !== 'all') {
        const classId = (s as any).student_class?.id ?? (s as any).student_class_id ?? null;

        if (this.selectedClassId === 'none') {
          if (classId !== null && classId !== undefined) return false;
        } else {
          if (String(classId ?? '') !== this.selectedClassId) return false;
        }
      }

      // level filter
      if (this.selectedLevelId !== 'all') {
        const levelId = (s as any).student_level?.id ?? (s as any).student_level_id ?? null;

        if (this.selectedLevelId === 'none') {
          if (levelId !== null && levelId !== undefined) return false;
        } else {
          if (String(levelId ?? '') !== this.selectedLevelId) return false;
        }
      }

      return true;
    });
  }

  disableStudent(studentId: number): void {
    const confirmed = window.confirm('Disable this student?');
    if (!confirmed) return;

    this.userService.deleteUser(studentId).subscribe({
      next: () => this.loadStudents(),
      error: err => console.error(err)
    });
  }

  private loadStudents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getMyStudents().subscribe({
      next: (students) => {
        this.canDisableStudents = false;
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
        this.canDisableStudents = true;
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
    this.buildFilterOptions(students);
    this.loading = false;
    this.filterStudents();
  }

  private toUserErrorMessage(err: HttpErrorResponse): string {
    const apiMessage = (err.error && (err.error.message || err.error.msg)) ? (err.error.message || err.error.msg) : '';
    if (apiMessage) return String(apiMessage);
    return 'An unexpected error occurred while loading students.';
  }

  private buildFilterOptions(students: User[]): void {
    const classMap = new Map<number, string>();
    const levelMap = new Map<number, string>();

    let hasNoClass = false;
    let hasNoLevel = false;

    for (const s of students) {
      const classId = (s as any).student_class?.id ?? (s as any).student_class_id ?? null;
      const classLabel =
        (s as any).student_class?.description ||
        (s as any).class_code ||
        (classId !== null && classId !== undefined ? `Class #${classId}` : '');

      if (classId === null || classId === undefined) {
        hasNoClass = true;
      } else if (classLabel) {
        classMap.set(classId, classLabel);
      }

      const levelId = (s as any).student_level?.id ?? (s as any).student_level_id ?? null;
      const levelLabel =
        (s as any).student_level?.description ||
        (levelId !== null && levelId !== undefined ? `Level #${levelId}` : '');

      if (levelId === null || levelId === undefined) {
        hasNoLevel = true;
      } else if (levelLabel) {
        levelMap.set(levelId, levelLabel);
      }
    }

    this.classOptions = Array.from(classMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this.levelOptions = Array.from(levelMap.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this.hasUnassignedClass = hasNoClass;
    this.hasUnassignedLevel = hasNoLevel;

    // sanitize selected values if options changed
    if (this.selectedClassId !== 'all' && this.selectedClassId !== 'none') {
      const exists = this.classOptions.some((c) => String(c.id) === this.selectedClassId);
      if (!exists) this.selectedClassId = 'all';
    }
    if (this.selectedLevelId !== 'all' && this.selectedLevelId !== 'none') {
      const exists = this.levelOptions.some((l) => String(l.id) === this.selectedLevelId);
      if (!exists) this.selectedLevelId = 'all';
    }
    if (this.selectedClassId === 'none' && !this.hasUnassignedClass) this.selectedClassId = 'all';
    if (this.selectedLevelId === 'none' && !this.hasUnassignedLevel) this.selectedLevelId = 'all';
  }
}