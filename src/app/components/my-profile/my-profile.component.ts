import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { User } from '../../interfaces/user.interface';
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  user!: User;

  originalData: User | null = null;

  isEditing = false;
  showDeleteModal = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.loadMe().subscribe(user => {
      console.log('USER FROM BACKEND:', user);
      if (!user) return;
      this.user = user;
      this.saveOriginalData();
    });
  }

  saveOriginalData(): void {
    this.originalData = { ...this.user };
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.originalData) {
      this.user = { ...this.originalData };
    }
    this.isEditing = false;
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.user?.id) return;

    const updatePayload = {
      name: this.user.name,
      surname: this.user.surname,
      email: this.user.email,
      dni: this.user.dni
    };

    this.userService.updateUser(this.user.id, updatePayload).subscribe({
      next: () => {
        this.loadProfile();
        this.isEditing = false;
      },
      error: (err) => console.error(err)
    });
  }

  changePassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { mode: 'change' }
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteAccount(): void {
  if (!this.user?.id) return;

  this.userService.deleteUser(this.user.id).subscribe({
    next: () => {
      this.showDeleteModal = false;

      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout error:', err);
          this.router.navigate(['/login']);
        }
      });
    },
    error: (err) => {
      console.error('Delete error:', err);
      alert('Error deleting account. Please try again.');
    }
  });
}

  get isStudent(): boolean {
    return this.user?.type === 'COORDINATOR';
  }

  get isTeacher(): boolean {
    return this.user?.type === 'TEACHER';
  }
}
