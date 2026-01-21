import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
  isLoading = false;
  errorMessage = "";

  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.authService.setAuthenticated(false);
        this.router.navigate(['/']);
      }
    });
  }

  get isCoordinator(): boolean {
    return this.authService.getUserType() === 'Coordinator';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

}
