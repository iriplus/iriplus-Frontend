import { Component, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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

  constructor(private router: Router) {}

  onSubmitEmail(): void {
    if (this.email) {
      console.log('Sending verification code to:', this.email);
      // Backend call to send the verification code goes here
      
      this.step = 2;

      // Focus the first code input after a brief delay
      setTimeout(() => {
        const inputs = this.codeInputs.toArray();
        if (inputs.length > 0) {
          inputs[0].nativeElement.focus();
        }
      }, 100);
    }
  }

  onSubmitCode(): void {
    const fullCode = this.code.join('');
    if (fullCode.length === 6) {
      console.log('Verifying code:', fullCode, 'for email:', this.email);
      // Backend call to verify the code goes here
      
      alert('Verification successful');
    }
  }

  resendCode(): void {
    console.log('Resending code to:', this.email);
    // Backend call to resend the code goes here
    
    alert('A new code has been sent to ' + this.email);
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
