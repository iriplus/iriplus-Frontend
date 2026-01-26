import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { TeacherFormComponent } from '../teacher-form/teacher-form.component';

@Component({
  selector: 'app-teachers',
  imports: [CommonModule,  TeacherFormComponent, FormsModule],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  teachers: User[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  filteredTeachers: User[] = [];


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
    const confirmed = confirm('¿Are you sure you want to delete this teacher?');
    if (!confirmed) return;

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.teachers = this.teachers.filter(t => t.id !== id);
      },
      error: () => {
        this.errorMessage = 'The teacher could not be removed';
      }
    });
  }

  filterTeachers(): void {
  const term = this.searchTerm.toLowerCase().trim();
  if (!term) {
    this.filteredTeachers = this.teachers;
    return;
  }

  this.filteredTeachers = this.teachers.filter(t =>
    t.name.toLowerCase().includes(term) ||
    t.surname.toLowerCase().includes(term) ||
    t.email.toLowerCase().includes(term) ||
    t.dni.toString().includes(term)
  );
}

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredTeachers = this.teachers;
  }
}
