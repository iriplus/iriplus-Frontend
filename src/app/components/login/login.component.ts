import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { environment } from "../../../environments/environment";

interface LoginResponse {
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

  private readonly LOGIN_URL = `${environment.backendUrl}/login`; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
  this.errorMessage = '';
  this.isLoading = true;

  this.http.post<LoginResponse>(this.LOGIN_URL, {email: this.email, password: this.password}, {withCredentials: true})
  .subscribe({next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password';
      },
    });
  }

  goToRegister(): void {
    this.router.navigate(["/register"]);
  }

  goToForgotPassword(): void {
    this.router.navigate(["/forgot-password"]);
  }
}
