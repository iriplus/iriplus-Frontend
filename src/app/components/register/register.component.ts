import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { User } from '../../interfaces/user.interface';
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
  class_code: string | null = null;

  classData: Class | null = null;
  existingUser: User | null = null;

  showPasswd = false;
  showConfirmPasswd = false;
  acceptTerms = false;

  isLoading = false;

  nameError = "";
  surnameError = "";
  emailError = "";
  dniError = "";
  passwordError = "";
  confirmPasswordError = "";
  classCodeError = "";
  termsError = "";
  errorMessage = "";

  togglePasswordVisibility(): void {
    this.showPasswd = !this.showPasswd;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPasswd = !this.showConfirmPasswd;
  }

  get isFormValid(): boolean {
    return !!this.name &&
      !!this.surname &&
      !!this.email &&
      !!this.dni &&
      !!this.passwd &&
      !!this.confirmPassword &&
      !!this.class_code &&
      !!this.acceptTerms;
  }

validateParams(): void {
  this.errorMessage = "";
  this.nameError = "";
  this.surnameError = "";
  this.emailError = "";
  this.dniError = "";
  this.passwordError = "";
  this.confirmPasswordError = "";
  this.classCodeError = "";
  this.termsError = "";

  if (!this.name.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)) {
    this.nameError = "*Name contains invalid characters.";
  }

  if (this.name.length > 255) {
    this.nameError = "*Name cannot exceed 255 characters.";
  }

  if (!this.surname.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)) {
    this.surnameError = "*Surname contains invalid characters.";
  }

  if (this.surname.length > 255) {
    this.surnameError = "*Surname cannot exceed 255 characters.";
  }

  if (!this.email.includes('@')) {
    this.emailError = "*Please enter a valid email address.";
  }

  if (this.email.length > 255) {
    this.emailError = "*Email cannot exceed 255 characters.";
  }

  if (this.dni.length > 10) {
    this.dniError = "*DNI cannot exceed 10 characters.";
  }

  if (this.passwd.length < 8) {
    this.passwordError = "*Password must be at least 8 characters.";
  }

  if (this.passwd.length > 255) {
    this.passwordError = "*Password cannot exceed 255 characters.";
  }

  if (this.passwd !== this.confirmPassword) {
    this.confirmPasswordError = "*Passwords do not match.";
  }

  if (!this.class_code || this.class_code.length !== 8) {
    this.classCodeError = "*Invalid class code.";
  }

  if (!this.acceptTerms) {
    this.termsError = "*You must accept the terms.";
  }

  if (
    this.nameError || this.surnameError || this.emailError ||
    this.dniError || this.passwordError || this.confirmPasswordError ||
    this.classCodeError || this.termsError
  ) {
    return;
  }

  this.register();
}

  register(): void {
    this.isLoading = true;

    const userData: User = {
      id: 0,
      name: this.name,
      surname: this.surname,
      email: this.email,
      passwd: this.passwd,
      dni: this.dni,
      type: 'STUDENT',
      class_code: this.class_code?.toUpperCase() || '',
      is_verified: false,
      profile_picture:'',
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Verification mail sent succesfully. Please check your inbox.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        switch (err.status) {
          case 400:
            this.errorMessage = "Invalid registration data";
            break;
          case 409:
            this.errorMessage = "Email or DNI already exists.";
            break;
          case 404:
            this.errorMessage = "Invalid class code";
            break;
          case 422:
            this.errorMessage = "Class is full";
            break;
          default:
            this.errorMessage = "Error creating account. Please try again.";
        }
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
