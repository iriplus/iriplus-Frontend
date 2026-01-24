import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { UserResponse } from '../../interfaces/user-response.interface';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  user!: UserResponse;
  originalData: UserResponse | null = null;

  isEditing = false;
  showDeleteModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.loadMe().subscribe(user => {
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

  onSubmit(): void {
    // PUT /me (más adelante)
    this.saveOriginalData();
    this.isEditing = false;
    alert('Perfil actualizado correctamente');
  }

  changePassword(): void {
    this.router.navigate(['/reset-password']);
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteAccount(): void {
    this.showDeleteModal = false;
    alert('Tu cuenta ha sido eliminada');
    this.router.navigate(['/login']);
  }
}
