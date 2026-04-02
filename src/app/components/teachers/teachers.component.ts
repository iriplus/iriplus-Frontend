import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { TeacherFormComponent } from '../teacher-form/teacher-form.component';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teachers',
  imports: [CommonModule, TeacherFormComponent, FormsModule, ConfirmDialogComponent],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  teachers: User[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  filteredTeachers: User[] = [];
  paginatedTeachers: User[] = [];
  currentPage = 1;
  pageSize = 10;
  showDeleteConfirm = false;
  teacherToDelete: User | null = null;


constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.userService.getTeachers().subscribe({
      next: (data: User[]) => {
        this.teachers = data;
        this.isLoading = false;
        this.filteredTeachers = data;
        this.currentPage = 1;
        this.updatePaginatedData();
      },
      error: () => {
        this.errorMessage = 'Error loading teachers';
        this.isLoading = false;
      }
    });
  }

  onTeacherCreated(): void {
  this.loadTeachers();
  const modalEl = document.getElementById('newTeacherModal');
  if (modalEl) {
    const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
  }
}

  deleteTeacher(id: number): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadTeachers();
      },
      error: () => {
        this.errorMessage = 'The teacher could not be removed';
      }
    });
  }

  openDeleteConfirm(teacher: User): void {
    this.teacherToDelete = teacher;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.teacherToDelete = null;
  }

  confirmDeleteTeacher(): void {
    if (!this.teacherToDelete) {
      return;
    }

    const teacherId = this.teacherToDelete.id;
    this.closeDeleteConfirm();
    this.deleteTeacher(teacherId);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTeachers.length / this.pageSize));
  }

  updatePaginatedData(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTeachers = this.filteredTeachers.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  filterTeachers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTeachers = this.teachers;
    } else {
      this.filteredTeachers = this.teachers.filter(t =>
        t.name.toLowerCase().includes(term) ||
        t.surname.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.dni.toString().includes(term)
      );
    }

    this.currentPage = 1;
    this.updatePaginatedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredTeachers = this.teachers;
    this.currentPage = 1;
    this.updatePaginatedData();
  }
}


