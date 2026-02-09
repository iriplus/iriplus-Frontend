import {Component,EventEmitter,Input,Output,OnChanges,SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-form.component.html',
  styleUrls: ['./teacher-form.component.css']
})
export class TeacherFormComponent {

  @Output() teacherCreated = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';
  showPasswd = false;
  showConfirmPasswd = false;
  confirmPassword = '';

  formData: User = {
    id: 0,
    name: '',
    surname: '',
    email: '',
    passwd: '',
    dni: '',
    type: 'TEACHER',
    teacher_classes: [],
    is_verified: false,
    profile_picture:'',
  };

  constructor(private userService: UserService) {}

  submit(): void {
    if (this.formData.passwd !== this.confirmPassword) {
      this.errorMessage = 'The passwords dont macht';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.createTeacher();
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

  resetForm(): void {
    this.formData = {
      id: 0,
      name: '',
      surname: '',
      email: '',
      passwd: '',
      dni: '',
      type: 'TEACHER',
      teacher_classes: [],
      is_verified: false,
      profile_picture:'',
    };
    this.confirmPassword = '';
  }
}
