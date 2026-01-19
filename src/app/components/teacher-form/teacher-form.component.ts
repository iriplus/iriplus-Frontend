import {Component,EventEmitter,Input,Output,OnChanges,SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { UserResponse } from '../../interfaces/user-response.interface';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-form.component.html',
})
export class TeacherFormComponent implements OnChanges {

  @Input() teacher: UserResponse | null = null;
  @Output() teacherCreated = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';
  showPasswd = false;
  showConfirmPasswd = false;
  confirmPassword = '';

  formData: User = {
    name: '',
    surname: '',
    email: '',
    passwd: '',
    dni: '',
    type: 'TEACHER'
  };

  constructor(private userService: UserService) {}

  submit(): void {
    if (this.formData.passwd !== this.confirmPassword) {
      this.errorMessage = 'The passwords dont macht';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.teacher) {
      this.updateTeacher();
    } else {
      this.createTeacher();
    }
  }

  createTeacher(): void {
    this.userService.createTeacher(this.formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.teacherCreated.emit();
        this.resetForm();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'The teacher could not be created';
      }
    });
  }

  updateTeacher(): void {
    if (!this.teacher) return;

    this.userService
      .updateTeacher(this.teacher.id, this.formData)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.teacherCreated.emit();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'The teacher could not be updated';
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacher'] && this.teacher) {
      this.formData = {
        name: this.teacher.name,
        surname: this.teacher.surname,
        email: this.teacher.email,
        dni: this.teacher.dni,
        passwd: '',
        type: 'TEACHER'
      };
      this.confirmPassword = '';
    }

    if (changes['teacher'] && !this.teacher) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formData = {
      name: '',
      surname: '',
      email: '',
      passwd: '',
      dni: '',
      type: 'TEACHER'
    };
    this.confirmPassword = '';
  }
}
