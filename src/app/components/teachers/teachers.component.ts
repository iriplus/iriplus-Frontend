import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../interfaces/user-response.interface';

@Component({
  selector: 'app-teachers',
  imports: [CommonModule],
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  teachers: UserResponse[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.userService.getTeachers().subscribe({
      next: (data: UserResponse[]) => {
        this.teachers = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error loading teachers';
        this.isLoading = false;
      }
    });
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
}
