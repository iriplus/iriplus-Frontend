import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class LoginComponent {
  email = ""
  password = ""
  showPassword = false
  rememberMe = false

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    console.log("Login attempt:", { email: this.email, rememberMe: this.rememberMe })
  }

  goToRegister(): void {
    this.router.navigate(["/register"])
  }

  goToForgotPassword(): void {
    this.router.navigate(["/forgot-password"])
  }
}
