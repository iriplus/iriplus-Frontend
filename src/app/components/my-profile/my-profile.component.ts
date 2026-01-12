import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";


@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {
  firstName = "Juan";
  lastName = "Pérez";
  email = "juan.perez@example.com";
  phone = "+54 11 1234-5678";
  birthDate = "1990-01-15";


  originalData: any = {};
  isEditing = false;
  showDeleteModal = false;


  constructor(private router: Router) {
    this.saveOriginalData();
  }


  saveOriginalData() {
    this.originalData = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      birthDate: this.birthDate,
    };
  }


  enableEdit() {
    this.isEditing = true;
  }


  cancelEdit() {
    Object.assign(this, this.originalData);
    this.isEditing = false;
  }


  onSubmit() {
    this.saveOriginalData();
    this.isEditing = false;
    alert("Perfil actualizado correctamente");
  }


  changePassword() {
    this.router.navigate(["/reset-password"]);
  }


  confirmDeleteAccount() {
    this.showDeleteModal = true;
  }


  closeDeleteModal() {
    this.showDeleteModal = false;
  }


  deleteAccount() {
    this.showDeleteModal = false;
    setTimeout(() => {
      alert("Tu cuenta ha sido eliminada");
      this.router.navigate(["/login"]);
    }, 500);
  }
}



