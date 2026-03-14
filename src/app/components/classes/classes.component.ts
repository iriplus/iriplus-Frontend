import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { NotificationService } from '../../services/notification.service';
import { Class } from '../../interfaces/class.interface';
import { ClassFormComponent } from '../class-form/class-form.component';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../interfaces/user.interface';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClassFormComponent, ConfirmDialogComponent],
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {
  selectedClass: Class | null = null;
  classes: Class[] = [];
  filteredClasses: Class[] = [];
  isLoading = true;
  errorMessage = '';
  searchText = '';
  showDeleteConfirm = false;
  classToDelete: Class | null = null;

  currentUser: UserType | null = null;
  currentUserId: number | null = null;

  constructor(
    private classService: ClassService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get isCoordinator(): boolean {
    return this.currentUser === UserType.COORDINATOR;
  }

  get isTeacher(): boolean {
    return this.currentUser === UserType.TEACHER;
  }

  get pageTitle(): string {
    return this.isTeacher ? 'My Classes': 'Class Management';
  }

  get pageSubtitle(): string {
    return this.isTeacher ? 'View the classes assigned to you' : 'Manage the systems classes';
  }

  get totalClassesLabel(): string {
    return this.isTeacher ? 'My Classes' : 'Total Classes';
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserType()
    this.currentUserId = this.authService.getCurrentUserId();

    this.loadClasses();
    this.registerModalReset();
  }

  private registerModalReset(): void {
    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.selectedClass = null;
      });
    }
  }

  loadClasses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.classService.getClasses().subscribe({
      next: (data: Class[]) => {
        this.classes = this.applyRolefilter(data);
        this.filteredClasses = [...this.classes];
        this.isLoading = false;
        console.log(this.filteredClasses)
      },
      error: () => {
        this.errorMessage = 'Error loading classes';
        this.isLoading = false;
      }
    });
  }

  private applyRolefilter(data: Class[]): Class[] {
    if (!this.isTeacher) {
      return data;
    }

    if (this.currentUserId == null) {
      return [];
    }

    return data.filter((c: any) => 
      Array.isArray(c.teachers) &&
      c.teachers.some((t: any) => t.id === this.currentUserId)
    );
  }

  onClassSaved(): void {
    if (!this.isCoordinator) {
      return;
    }

    this.selectedClass = null;
    this.loadClasses();

    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }

  openEdit(classData: Class): void {
    if (!this.isCoordinator) {
      return;
    }

    this.selectedClass = classData;

    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  deleteClass(id: number): void {
    if (!this.isCoordinator) {
      return;
    }

    this.classService.deleteClass(id).subscribe({
      next: () => {
        this.loadClasses();
        this.notificationService.show({
          type: 'success',
          title: 'Class deleted',
          message: 'Class deleted succesfully',
          autoCloseMs: 3500,
        })
      },
      error: (err) => {
        this.notificationService.show({
          type: 'error',
          title: 'Could not delete class',
          message: this.getDeleteErrorMessage(err),
          autoCloseMs: 5000
        })
      }
    });
  }

  openDeleteConfirm(classData: Class): void {
    if (!this.isCoordinator) {
      return;
    }

    this.classToDelete = classData;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.classToDelete = null;
  }

  confirmDeleteClass(): void {
    if (!this.classToDelete) {
      return;
    }

    const classId = this.classToDelete.id;
    this.closeDeleteConfirm();
    this.deleteClass(classId);
  }

  viewClass(classData: Class): void {
    console.log('View class clicked: ', classData);
  }

  filterClasses(): void {
    const term = this.searchText.toLowerCase().trim();
    if (!term) {
      this.filteredClasses = this.classes;
      return;
    }

    this.filteredClasses = this.classes.filter(c =>
      c.class_code.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.suggested_level.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredClasses = this.classes;
  }

  private getDeleteErrorMessage(err: any): string {
    switch (err?.status) {
      case 404:
        return err?.error?.message ?? 'Class not found.';

      case 409:
        return err?.error?.message ?? 'This class cannot be deleted because it has active students.';

      case 400:
        return err?.error?.message ?? 'Invalid request.';

      case 403:
        return err?.error?.message ?? 'You do not have permission to delete this class.';

      case 500:
        return err?.error?.message ?? 'A server error occurred while deleting the class.';

      default:
        return err?.error?.message ?? 'The class could not be removed.';
    }
  }
}
