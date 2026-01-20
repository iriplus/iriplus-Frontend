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

  login(): void {
    this.isLoading = true;
    this.errorMessage = "";

    if (!this.email || !this.password) {
      this.errorMessage = "Please enter both email and password.";
      this.isLoading = false;
      return;
    } else if (!this.email.includes('@')) {
        this.errorMessage = "Please enter a valid email address.";
        this.isLoading = false;
        return;
    } else if (this.email.length > 255) {
        this.errorMessage = "Email cannot exceed 255 characters.";
        this.isLoading = false;
        return;
    } else if (this.password.length < 8) {
        this.errorMessage = "Password must be at least 8 characters long.";
        this.isLoading = false;
        return;
    } else if (this.password.length > 255) {
        this.errorMessage = "Password cannot exceed 255 characters.";
        this.isLoading = false;
        return;
    }

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
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Wrong email or password';
        return;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(["/register"]);
  }

  goToForgotPassword(): void {
    this.router.navigate(["/forgot-password"]);
  }
}
