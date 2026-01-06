import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from "../../../environments/environment";

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
  name = '';
  surname = '';
  email = '';
  password = '';
  confirmPassword = '';
  dni = '';
  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;

  private readonly REGISTER_URL = `${environment.backendUrl}/user/student`;

  constructor(private router: Router, private http: HttpClient) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (!this.acceptTerms) {
      alert('You must accept the terms and conditions.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const userData = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      passwd: this.password,
      dni: this.dni,
    };

    this.http.post(this.REGISTER_URL, userData).subscribe({
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
