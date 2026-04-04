import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../interfaces/user.interface';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage = "";
  private navigationSub?: Subscription;

  private readonly LOGOUT_URL = `${environment.backendUrl}/logout`; 

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.closeMobileMenu();
    this.navigationSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => this.closeMobileMenu());
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
    this.closeMobileMenu();
  }

  goTo(path: string): void {
    this.closeMobileMenu();
    this.router.navigate([path]);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout().subscribe({
      next: () => {
        this.authService.setAuthenticated(false);
        this.router.navigate(['/']);
      }
    });
  }

  get isCoordinator(): boolean {
    return this.authService.getUserType() === UserType.COORDINATOR;
  }

  get isTeacher(): boolean {
    return this.authService.getUserType() === UserType.TEACHER;
  }

  get isStudent(): boolean {
    return this.authService.getUserType() === UserType.STUDENT;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private closeMobileMenu(): void {
    if (!this.isBrowser()) {
      return;
    }

    const offcanvasEl = document.getElementById('offcanvasNavbar');
    const bootstrap = (window as any).bootstrap;

    if (offcanvasEl && bootstrap?.Offcanvas) {
      const instance =
        bootstrap.Offcanvas.getInstance(offcanvasEl) ??
        bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      instance.hide();
    }

    this.cleanupOffcanvasArtifacts();
  }

  private cleanupOffcanvasArtifacts(): void {
    document.body.classList.remove('overflow-hidden');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';

    document.querySelectorAll('.offcanvas-backdrop').forEach((backdrop) => {
      backdrop.remove();
    });
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
