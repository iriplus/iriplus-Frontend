import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

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
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getTeachers().subscribe(data => {
      this.teachers = data;
    })
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
        this.classSaved.emit();
        this.resetForm();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'The class could not be created';
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
        this.classSaved.emit();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'The class could not be updated';
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
}