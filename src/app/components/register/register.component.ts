import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { ClassResponse } from '../../interfaces/class.interface';

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
  classId: number | null = null;
  acceptTerms = false;

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

     if (this.classId === null) {
    alert('Please enter your class code.');
    return;
  }

   this.classService.exists(this.classId).subscribe({
    next: exists => {
      if (!exists) {
        alert('Invalid class code.');
        return;
      }

      this.register();
    }
  });
}

  register(): void {
    const userData = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      passwd: this.password,
      dni: this.dni,
      student_class_id: this.classId,
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        console.log('User registered:', res);
        alert('Verification mail sent succesfully. Please check your inbox.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed:', err);
        alert('Error creating account. Please try again.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
