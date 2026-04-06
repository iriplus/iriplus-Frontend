import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../interfaces/user.interface';
import { ConfirmDialogComponent, ConfirmDialogState } from '../ui/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, NgIf, ConfirmDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
  isLoading = false;
  errorMessage = "";

  confirmDialog: ConfirmDialogState = {
    open: false,
    action: null,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  openLogoutConfirm(): void {
    this.confirmDialog = {
      open: true,
      action: 'logout',
      title: 'Log out?',
      message: 'Your current session will be closed.',
      confirmText: 'Log Out',
      cancelText: 'Stay here',
      variant: 'default',
    };
  }

  closeConfirmDialog(): void {
    this.confirmDialog = {
      ...this.confirmDialog,
      open: false,
      action: null,
    };
  }

  handleConfirm(): void {
    switch (this.confirmDialog.action) {
      case 'logout':
        this.closeConfirmDialog();
        this.performLogout();
        break;
      default:
        this.closeConfirmDialog();
        break;
    }
  }

  private performLogout(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.logout().subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.setAuthenticated(false);

        this.notificationService.show({
          type: 'success',
          title: 'Session closed',
          message: 'You have logged out successfully.',
          autoCloseMs: 3000,
        });

        this.router.navigate(['/']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not log out. Please try again.';

        this.notificationService.show({
          type: 'error',
          title: 'Logout failed',
          message: 'Could not log out. Please try again.',
          autoCloseMs: 4000,
        });
      },
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

}
