import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { RegisterStudent } from '../../interfaces/register.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent {
  constructor(
    private router: Router, 
    private authService: AuthService,
    private classService: ClassService,
  ) {}

  name = '';
  surname = '';
  email = '';
  password = '';
  confirmPassword = '';
  dni = '';
  showPassword = false;
  showConfirmPassword = false;
  class_code: string | null = null;
  acceptTerms = false;
  classData: Class | null = null;

  private readonly REGISTER_URL = `${environment.backendUrl}/user/student`;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateParams(): void {
    if (!this.acceptTerms) {
      alert('You must accept the terms and conditions.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

     if (!this.class_code) {
    alert('Please enter your class code.');
    return;
  }

   this.classService.getClass(this.class_code).subscribe({
    next: cls => {
      this.classData = cls;
      this.register();
    },
    error: err => {
      if (err.status === 404) {
        alert('Invalid class code. Please check and try again.');
      } else {
        alert('An error occurred while validating the class code. Please try again later.');
      }
    }
  });
}

  register(): void {
    if (!this.classData) {
      alert('Class data is not available. Cannot proceed with registration.');
      return;
    }
    
    const userData: RegisterStudent = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      passwd: this.password,
      dni: this.dni,
      student_class_id: this.classData.id,
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        alert('Verification mail sent succesfully. Please check your inbox.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Error creating account. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
