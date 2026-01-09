import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";

export interface LoginResponse {
  access_token: string;
}

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = "";

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
        this.authService.setAuthenticated(true);
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password';
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
