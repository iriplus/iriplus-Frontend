import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Login } from "../../interfaces/login.interface";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  private returnUrl = '/home';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
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

    if (this.emailError || this.passwordError) {
        return;
    }

    this.isLoading = true;

    const credentials: Login = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.authService.loadMe().subscribe(() => {
          this.isLoading = false;
          this.router.navigateByUrl(this.returnUrl);
        });
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 403) {
          this.errorMessage = 'Your account is not verified. Please check your email for the verification link.';
          return;
        } else if (err.status === 401) {
          this.errorMessage = 'Wrong email or password';
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
