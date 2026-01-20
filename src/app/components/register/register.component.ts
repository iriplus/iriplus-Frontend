import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { Student, User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

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
    private userService: UserService,
  ) {}

  name = '';
  surname = '';
  email = '';
  passwd = '';
  confirmPassword = '';
  dni = '';
  showPasswd = false;
  showConfirmPasswd = false;
  class_code: string | null = null;
  acceptTerms = false;

  classData: Class | null = null;
  existingUser: User | null = null;

  isLoading = false;

  togglePasswordVisibility(): void {
    this.showPasswd = !this.showPasswd;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPasswd = !this.showConfirmPasswd;
  }

  validateParams(): void {
    this.isLoading = true;
    // Validates Name
    if (!this.name) {
      alert('Please enter your name.');
      this.isLoading = false;
      return;
    } else if (!this.name.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)){
        alert('Name can only contain letters, spaces, apostrophes, and hyphens.');
        this.isLoading = false;
        return;
    } else if (this.name.length > 255) {
        alert('Name cannot exceed 255 characters.');
        this.isLoading = false;
        return;
    }

    // Validates Surname
    if (!this.surname) {
      alert('Please enter your surname.');
      this.isLoading = false;
      return;
    } else if (!this.surname.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)){
        alert('Surname can only contain letters, spaces, apostrophes, and hyphens.');
        this.isLoading = false;
        return;
    } else if (this.surname.length > 255) {
        alert('Surname cannot exceed 255 characters.');
        this.isLoading = false;
        return;
    }
    
    // Validates Email
    if (!this.email) {
      alert('Please enter your email address.');
      this.isLoading = false;
      return;
    } else if (!this.email.includes('@')) {
        alert('Please enter a valid email address.');
        this.isLoading = false;
        return;
    } else if (this.email.length > 255) {
        alert('Email cannot exceed 255 characters.');
        this.isLoading = false;
        return;
    } else {
      this.userService.getUserByEmail(this.email).subscribe({
        next: user => {
          this.existingUser = user;
          if (this.existingUser) {
            alert('An account with this email already exists. Please use a different email.');
            this.isLoading = false;
            return;
          }
        },
      });
    }

    // Validates DNI
    if (!this.dni) {
      alert('Please enter your DNI.');
      this.isLoading = false;
      return;
    } else if (this.dni.length > 10) {
        alert('DNI cannot exceed 10 characters.');
        this.isLoading = false;
        return;
    } else {    
      this.userService.getUserByDNI(this.dni).subscribe({
        next: user => {
          this.existingUser = user;
          if (this.existingUser) {
            alert('An account with this DNI already exists. Please use a different DNI.');
            this.isLoading = false;
            return;
          }
        },
      });
    }

    // Validates Password
    if (!this.passwd || !this.confirmPassword) {
      alert('Please enter and confirm your password.');
      this.isLoading = false;
      return;
    }

    if (this.passwd.length < 8) {
      alert('Password must be at least 8 characters long.');
      this.isLoading = false;
      return;
    } else if (this.passwd.length > 255) {
        alert('Password cannot exceed 255 characters.');
        this.isLoading = false;
        return;
    }

    if (this.passwd !== this.confirmPassword) {
      alert('Passwords do not match.');
      this.isLoading = false;
      return;
    }

    // Validates Class Code
    if (!this.class_code) {
      alert('Please enter your class code.');
      this.isLoading = false;
      return;
    } else if (this.class_code.length !== 8) {
        alert('Class code must be exactly 8 characters long.');
        this.isLoading = false;
        return;
    } else {
      this.classService.getClass(this.class_code.toUpperCase()).subscribe({
        next: cls => {
          this.classData = cls;
          // Validates Terms and Conditions
          if (!this.acceptTerms) {
            alert('You must accept the terms and conditions.');
            this.isLoading = false;
          return;
    }
      this.register();

        },
        error: err => {
    if (err.status === 404) {
      alert('Invalid class code. Please check and try again.');
    } else {
      alert('An error occurred while validating the class code.');
    }
    this.isLoading = false;
  }
      });
    }

    

  }

  register(): void {
    if (!this.classData) {
      alert('Class data is missing. Cannot proceed with registration.');
      this.isLoading = false;
      return;
    }

    const userData: Student = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      passwd: this.passwd,
      dni: this.dni,
      type: 'STUDENT',
      student_class_id: this.classData.id
    };

    this.authService.register(userData).subscribe({
      next: () => {
        alert('Verification mail sent succesfully. Please check your inbox.');
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        alert('Error creating account. Please try again.');
        this.isLoading = false;
        return;
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
