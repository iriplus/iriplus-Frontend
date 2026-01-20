import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';

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

  formData: Partial<Class> = {
    class_code: '',
    description: '',
    suggested_level: '',
    max_capacity: 0
  };

  constructor(private classService: ClassService) {}

  submit(): void {
    if (!this.formData.class_code || !this.formData.description || !this.formData.suggested_level) {
      this.errorMessage = 'Please complete all required fields';
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
    this.classService.createClass(this.formData).subscribe({
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

    this.classService.updateClass(this.classData.id, this.formData).subscribe({
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classData'] && this.classData) {
      this.formData = {
        class_code: this.classData.class_code,
        description: this.classData.description,
        suggested_level: this.classData.suggested_level,
        max_capacity: this.classData.max_capacity
      };
    }

    if (changes['classData'] && !this.classData) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formData = {
      class_code: '',
      description: '',
      suggested_level: '',
      max_capacity: 0
    };
  }
}