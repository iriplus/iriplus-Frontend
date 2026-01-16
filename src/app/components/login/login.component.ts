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

    const credentials: Login = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.setAuthenticated(true);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password';
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
