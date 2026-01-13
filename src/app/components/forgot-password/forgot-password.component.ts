import { Component, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ForgotPasswordComponent {
  email = '';
  step = 1; // Controls the current step: 1 = enter email, 2 = enter code
  code: string[] = ['', '', '', '', '', '']; // Array that holds the 6-digit verification code
  
  @ViewChildren('input0, input1, input2, input3, input4, input5') codeInputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onSubmitEmail(): void {
    if (!this.email) return;

    this.authService.sendResetCode(this.email).subscribe({
      next: () => {
        this.step = 2;
        setTimeout(() => {
          const inputs = this.codeInputs.toArray();
          if (inputs.length > 0) inputs[0].nativeElement.focus();
        }, 100);
      },
      error: err => {
        alert(err.error?.msg || 'Error sending code');
      }
    });
  }

  onSubmitCode(): void {
    const fullCode = this.code.join('');
    if (fullCode.length !== 6) return;

    this.authService.verifyResetCode(this.email, fullCode).subscribe({
      next: () => {
        this.authService.setIsResettingPassword(true);
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: err => {
        alert(err.error?.msg || 'Invalid or expired code');
      }
    });
  }

  resendCode(): void {
    this.authService.sendResetCode(this.email).subscribe({
      next: () => alert('A new code has been sent'),
      error: err => alert(err.error?.msg || 'Error resending code')
    });
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Allow only numbers
    if (value && !/^\d$/.test(value)) {
      this.code[index] = '';
      input.value = '';
      return;
    }
    
    // If a digit is entered, move to the next input
    if (value && index < 5) {
      const inputs = this.codeInputs.toArray();
      inputs[index + 1].nativeElement.focus();
    }
  }

  onCodeKeydown(event: KeyboardEvent, index: number): void {
    // If Backspace is pressed on an empty input, move to the previous one
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const inputs = this.codeInputs.toArray();
      inputs[index - 1].nativeElement.focus();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
