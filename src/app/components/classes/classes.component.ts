import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { ClassFormComponent } from '../class-form/class-form.component';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../interfaces/user.interface';


@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClassFormComponent],
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

  currentUser: UserType | null = null;
  currentUserId: number | null = null;

  constructor(
    private classService: ClassService,
    private authService: AuthService
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

    const confirmed = confirm('Are you sure you want to delete this class?');
    if (!confirmed) return;

    this.classService.deleteClass(id).subscribe({
      next: () => {
        this.classes = this.classes.filter(c => c.id !== id);
        this.filterClasses();
      },
      error: () => {
        this.errorMessage = 'The class could not be removed';
      }
    });
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
}