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
    this.isLoading = true;

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
      this.isLoading = false;
    } 
    
    if (this.name.length > 255) {
      this.nameError = "*Name cannot exceed 255 characters.";
      this.isLoading = false;
    }

    if (!this.surname.match(/^[a-zA-ZÀ-ÿ\s'-]+$/)) {
      this.surnameError = "*Surname can only contain letters, spaces, apostrophes, and hyphens.";
      this.isLoading = false;
    }
    
    if (this.surname.length > 255) {
      this.surnameError = "*Surname cannot exceed 255 characters.";
      this.isLoading = false;
    }

    if (!this.email.includes('@')) {
      this.emailError = "*Please enter a valid email address.";
      this.isLoading = false;
    }
    if (this.email.length > 255) {
      this.emailError = "*Email cannot exceed 255 characters.";
    }

    if (this.emailError) {
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

    if (this.dni.length > 10) {
      this.dniError = "*DNI cannot exceed 10 characters.";
      this.isLoading = false;
    } 
    
    if (this.dniError) {    
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

    if (this.passwd.length < 8) {
      this.passwordError = "*Password must be at least 8 characters long.";
      this.isLoading = false;
    } 

    if (this.passwd.length > 255) {
      this.passwordError = "*Password cannot exceed 255 characters.";
      this.isLoading = false;
    }

    if (this.passwd !== this.confirmPassword) {
      this.confirmPasswordError = "*Passwords do not match.";
      this.isLoading = false;
    }

    if (!this.class_code) {
      this.classCodeError = "*Class code is required.";
      this.isLoading = false;
    } else if (this.class_code.length !== 8) {
        this.classCodeError='*Class code must be exactly 8 characters long.';
        this.isLoading = false;
    } 

    if (!this.acceptTerms) {
      this.termsError = "*You must accept the terms and conditions.";
      this.isLoading = false;
    }

    if (
      this.nameError || this.surnameError || this.emailError ||
      this.dniError || this.passwordError || this.confirmPasswordError ||
      this.classCodeError || this.termsError
    ) {return;}

    this.userService.getUserByEmail(this.email).subscribe({
      next: user => {
        if (user) {
          this.emailError = "*An account with this email already exists.";
          this.isLoading = false;
          return;
        }
      },
      error: () => {
        this.userService.getUserByDNI(this.dni).subscribe({
          next: userDni => {
            if (userDni) {
              this.dniError = "*An account with this DNI already exists.";
              this.isLoading = false;
              return;
            }
          },
          error: () => {
            this.classService.getClass(this.class_code!.toUpperCase()).subscribe({
              next: cls => {
                this.classData = cls;
                this.register();
              },
              error: () => {
                this.isLoading = false;
                this.classCodeError = "*Invalid class code. Please check and try again."
              }
            });
        }});
      }
    });
  }

  register(): void {
    if (!this.classData) {
      this.errorMessage='Class data is missing. Cannot proceed with registration.';
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
        this.errorMessage='Error creating account. Please try again.';
        this.isLoading = false;
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
