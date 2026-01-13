import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
  email: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (!this.authService.getIsResettingPassword()) {
      this.router.navigate(['/forgot-password']);
    }

    this.route.queryParams.subscribe(params => {
      const email = params['email'];

      if (!email) {
        this.router.navigate(['/forgot-password']);
        return;
      }

      this.email = email;
    });
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

    console.log(this.email, this.password);
    this.authService.resetPassword(this.email, this.password).subscribe({
      next: () => {
        alert('Password successfully reset');
        this.authService.setIsResettingPassword(false);
        this.router.navigate(['/login']);
      },
      error: err => {
        alert(err.error?.msg || 'Error resetting password');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
