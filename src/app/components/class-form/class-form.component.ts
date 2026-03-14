import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-form.component.html',
  styleUrls: ['./class-form.component.css']
})
export class ClassFormComponent implements OnChanges {

  @Input() classData: Class | null = null;
  @Output() classSaved = new EventEmitter<void>();

  isLoading = false;
  errorMessage = '';

  teachers: User[] = []
  selectedTeacherIds: number[] = []

  formData: Partial<Class> = {
    class_code: '',
    description: '',
    suggested_level: '',
    max_capacity: 0,
  };

  constructor(
    private classService: ClassService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userService.getTeachers().subscribe({
      next: (data) => {
      this.teachers = data;
    },
      error: () => {
        this.notificationService.show({
          type: 'error',
          title: 'Could not load teachers',
          message: 'The teacher list could not be loaded.',
          autoCloseMs: 5000,
        });
      }
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classData'] && this.classData) {
      this.formData = {
        class_code: this.classData.class_code,
        description: this.classData.description,
        suggested_level: this.classData.suggested_level,
        max_capacity: this.classData.max_capacity
      };
      this.selectedTeacherIds = this.classData.teachers?.map(t => t.id) || [];
      this.errorMessage = '';
    }
    if (changes['classData'] && !this.classData) {
      this.resetForm();
    }
  }

  submit(): void {
    if (!this.formData.description || !this.formData.suggested_level || !this.formData.max_capacity) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }

    if (this.selectedTeacherIds.length > 2) {
      this.errorMessage = "A class can have at most 2 teachers.";
      return;
    }

    if (this.classData && Number(this.formData.max_capacity) < (this.classData.students?.length ?? 0)) {
      this.errorMessage ="Max capacity cannot be lower than the number of active enrolled students."
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.classData) {
      this.updateClass();
    } else {
      this.createClass();
    }
  }

  createClass(): void {
    const payload = {
      ...this.formData,
      teacher_ids: this.selectedTeacherIds
    };

    this.classService.createClass(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.errorMessage = '';

        this.notificationService.show({
          type: 'success',
          title: 'Class created',
          message: 'The class was created succesfully',
          autoCloseMs: 3500,
        });

        this.classSaved.emit();
        this.resetForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.show({
          type: 'error',
          title: 'Could not create class',
          message: this.getCreateErrorMessage(err),
          autoCloseMs: 5000,
        })
      }
    });
  }

  updateClass(): void {
    if (!this.classData) return;

    const payload = {
      ...this.formData,
      teacher_ids: this.selectedTeacherIds
    };

    this.classService.updateClass(this.classData.id, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.errorMessage = '';

        this.notificationService.show({
          type: 'success',
          title: 'Class updated',
          message: 'The class was updated succesfully',
          autoCloseMs: 3500,
        });
        this.classSaved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.show({
          type: 'error',
          title: 'Could not update class',
          message: this.getUpdateErrorMessage(err),
          autoCloseMs: 5000,
        })
      }
    });
  }

  resetForm(): void {
    this.formData = {
      class_code: '',
      description: '',
      suggested_level: '',
      max_capacity: 0
    };
    this.selectedTeacherIds = [];
    this.errorMessage = '';
  }

  isSelected(id: number): boolean {
    return this.selectedTeacherIds.includes(id);
  }

  toggleTeacher(id: number): void {
    if (this.isSelected(id)) {
      this.selectedTeacherIds = this.selectedTeacherIds.filter(t => t !== id);
      return;
    }

    if (this.selectedTeacherIds.length >= 2) {
      this.errorMessage = 'A class can have at most 2 teachers.';
      return;
    }

    this.errorMessage = '';
    this.selectedTeacherIds = [...this.selectedTeacherIds, id];
  }

  removeTeacher(id: number): void {
    this.selectedTeacherIds = this.selectedTeacherIds.filter(t => t !== id);
  }

  getTeacherName(id: number): string {
    const teacher = this.teachers.find(t => t.id === id);
    return teacher ? `${teacher.surname}, ${teacher.name}` : '';
  }

  private getCreateErrorMessage(err: any): string {
    switch (err?.status) {
      case 400:
        return err?.error?.message ?? 'Invalid class data.';
      case 403:
        return err?.error?.message ?? 'You do not have permission to create classes.';
      case 409:
        return err?.error?.message ?? 'A class with the same data already exists.';
      case 500:
        return 'A server error occurred while creating the class.';
      default:
        return err?.error?.message ?? 'The class could not be created.';
    }
  }

  private getUpdateErrorMessage(err: any): string {
    switch (err?.status) {
      case 400:
        return err?.error?.message ?? 'Invalid class data.';
      case 403:
        return err?.error?.message ?? 'You do not have permission to update this class.';
      case 404:
        return err?.error?.message ?? 'Class not found.';
      case 409:
        return err?.error?.message ?? 'Max capacity cannot be lower than the number of active enrolled students.';
      case 500:
        return 'A server error occurred while updating the class.';
      default:
        return err?.error?.message ?? 'The class could not be updated.';
    }
  }
}