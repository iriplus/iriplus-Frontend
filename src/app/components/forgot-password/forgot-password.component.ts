import { Component, ViewChild, ElementRef, QueryList, ViewChildren, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { error } from 'console';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ForgotPasswordComponent implements OnInit {
  email = '';
  step = 1; // Controls the current step: 1 = enter email, 2 = enter code
  code: string[] = ['', '', '', '', '', '']; // Array that holds the 6-digit verification code

  isLoading = false;

  emailError = "";
  codeError = "";
  errorMessage = "";
  mode: 'forgot' | 'change' = 'forgot';

  
  @ViewChildren('input0, input1, input2, input3, input4, input5') codeInputs!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.mode = params['mode'] === 'change' ? 'change' : 'forgot';
  });
}

  get isEmailValid(): boolean {
    return !!this.email;
  }

  get isCodeValid(): boolean {
    return this.code.join('').length === 6;
  }

  onSubmitEmail(): void {
    this.errorMessage = "";
    this.emailError = "";

    if (!this.email) {
      this.emailError = "*Email is required.";
      return;
    }

    if (!this.email.includes('@')) {
      this.emailError = "*Please enter a valid email address.";
      this.isLoading = false;
    }

    if (this.email.length > 255) {
      this.emailError = "*Email cannot exceed 255 characters.";
    }

    if (!this.emailError) {
      this.isLoading = true;
      this.userService.getUserByEmail(this.email).subscribe({
        next: () => {
          this.authService.sendResetCode(this.email).subscribe({
            next: () => {
              alert('A verification code has been sent to your email.');
              this.isLoading = false;
              this.step = 2;
              setTimeout(() => {
                const inputs = this.codeInputs.toArray();
                if (inputs.length > 0) inputs[0].nativeElement.focus();
              }, 100);
            },
            error: err => {
              this.isLoading = false;
              this.errorMessage = err.error?.msg || 'Error sending code';
            }
          });
        },
        error: () => {
          this.emailError = "*No account found with this email.";
          this.isLoading = false;
        }
      });
    };
  }

  onSubmitCode(): void {
    this.errorMessage = "";
    this.codeError = "";

    const fullCode = this.code.join('');

    if (fullCode.length !== 6) {
      this.codeError = "*Please enter the 6-digit code.";
      return;
    }

    this.isLoading = true;

    this.authService.verifyResetCode(this.email, fullCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.setIsResettingPassword(true);
        this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.msg || 'Invalid or expired code';
      }
    });
  }

  resendCode(): void {
    this.errorMessage = "";
    this.isLoading = true;

    this.authService.sendResetCode(this.email).subscribe({
      next: () => {
        alert('A new verification code has been sent to your email.');
        this.isLoading = false;
        this.step = 2;
        setTimeout(() => {
          const inputs = this.codeInputs.toArray();
          if (inputs.length > 0) inputs[0].nativeElement.focus();
        }, 100);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err.error?.msg || 'Error sending new code';
      }
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

  goBack(): void {
  if (this.mode === 'change') {
    this.router.navigate(['/my-profile']);
  } else {
    this.router.navigate(['/login']);
  }
}
}
