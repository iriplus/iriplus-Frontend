import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [CommonModule, FormsModule] 
})
export class ResetPasswordComponent {
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  constructor(private router: Router) {}

  ngOnInit() {
    // Verify that the user has completed the previous steps
    // Here you could validate tokens or stored verification states
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  calculatePasswordStrength(): void {
    if (!this.password) {
      this.passwordStrength = 'weak';
      return;
    }

    let strength = 0;

    // Length checks
    if (this.password.length >= 8) strength++;
    if (this.password.length >= 12) strength++;

    // Uppercase letters
    if (/[A-Z]/.test(this.password)) strength++;

    // Numbers
    if (/[0-9]/.test(this.password)) strength++;

    // Special characters
    if (/[^A-Za-z0-9]/.test(this.password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 'weak';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  getPasswordStrengthWidth(): string {
    switch (this.passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
      default: return '0%';
    }
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (this.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // Call your backend service here to reset the password
    console.log('Resetting password...');

    // Simulate success and redirect to login
    setTimeout(() => {
      alert('Password successfully reset');
      this.router.navigate(['/login']);
    }, 500);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
