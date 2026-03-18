import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { finalize, switchMap } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Login } from "../../interfaces/login.interface";
import { environment } from "../../../environments/environment";
import { RecaptchaModule, RecaptchaComponent } from "ng-recaptcha-2";
import { NotificationService } from "../../services/notification.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule, RecaptchaModule],
})
export class LoginComponent {
  email = "";
  password = "";
  showPassword = false;
  rememberMe = false;
  isLoading = false;

  errorMessage = "";
  emailError = "";
  passwordError = "";
  captchaError = "";

  @ViewChild(RecaptchaComponent)
  captcha?: RecaptchaComponent;

  captchaToken: string | null = null;
  siteKey = environment.recaptchaSiteKey;

  private returnUrl = '/home';

  private handledVerified = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  resolvedCaptcha(token: string | null) {
    this.captchaToken = token;
  }

  resetCaptcha() {
    this.captcha?.reset();
  }
ngOnInit(): void {
  this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

  this.route.queryParamMap.subscribe((params) => {
    const verifiedFromRoute = params.get('verified');
    const verifiedFromUrl = new URLSearchParams(window.location.search).get('verified');
    const verified = verifiedFromRoute || verifiedFromUrl;

    console.log('verified route:', verifiedFromRoute);
    console.log('verified url:', verifiedFromUrl);

    if (!verified || this.handledVerified) {
      return;
    }

    this.handledVerified = true;

    if (verified === 'success') {
      this.notificationService.show({
        type: 'success',
        title: 'Operation Successful',
        message: 'Verification successful. You can now log in.',
        autoCloseMs: 5000,
      });
    } else if (verified === 'already') {
      this.notificationService.show({
        type: 'info',
        title: 'Already verified',
        message: 'Your email is already verified. You can log in.',
        autoCloseMs: 5000,
      });
    } else if (verified === 'invalid') {
      this.notificationService.show({
        type: 'error',
        title: 'Verification failed',
        message: 'Invalid or expired verification link.',
        autoCloseMs: 5000,
      });
    } else if (verified === 'not-found') {
      this.notificationService.show({
        type: 'error',
        title: 'Verification failed',
        message: 'User not found.',
        autoCloseMs: 5000,
      });
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { verified: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get isFormValid(): boolean {
    return !!this.email && !!this.password;
  }

  login(): void {
    this.errorMessage = "";
    this.emailError = "";
    this.passwordError = "";
    this.captchaError = "";

    if (!this.email.includes('@')) {
        this.emailError = "*Please enter a valid email address.";
    } 
    
    if (this.email.length > 255) {
        this.emailError = "*Email cannot exceed 255 characters.";
    }
    
    if (this.password.length < 8) {
        this.passwordError = "*Password must be at least 8 characters long.";
    } 
    
    if (this.password.length > 255) {
        this.passwordError = "*Password cannot exceed 255 characters.";
    }

    if (!this.captchaToken) {
      this.captchaError = "Please complete the captcha.";
      return;
    }

    if (this.emailError || this.passwordError) {
        return;
    }

    this.isLoading = true;

    const credentials: Login = {
      email: this.email,
      password: this.password,
      captcha: this.captchaToken
    };

    this.authService.login(credentials).pipe(
      switchMap(() => this.authService.loadMe(true)),
      finalize(() => { 
        this.isLoading = false
      })
    ).subscribe({
      next: (user) => {
        if (!user) {
          this.errorMessage = 'Could not load user session after login';
          return;
        }
          this.isLoading = false;
          this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.resetCaptcha();

        if (err.status === 403) {
          this.errorMessage = 'Your account is not verified. Please check your email for the verification link.';
          return;
        } else if (err.status === 401) {
          this.errorMessage = 'Wrong email or password';
        } else if (err.status === 400) {
          this.errorMessage = 'Captcha verification failed';
        } else {
          this.errorMessage = 'An error occurred during login. Please try again later.';
        }
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(["/register"]);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], {
    queryParams: { mode: 'forgot' }
    });
  }
}