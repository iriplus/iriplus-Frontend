import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Exercise, ExercisePayload } from '../../interfaces/exercise.interface';
import { ExerciseService } from '../../services/exercise.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-exercises',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css',
})

export class ExercisesComponent implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  paginatedExercises: Exercise[] = [];
  currentPage = 1;
  pageSize = 10;

  searchTerm = '';

  showModal = false;
  isEditing = false;
  saving = false;
  deleting = false;

  showDeleteConfirm = false;
  deleteDialogMessage = '';
  exerciseToDelete: Exercise | null = null;

  nameError = '';
  contentDescriptionError = '';

  currentExercise: Exercise = this.createEmptyExercise();

  constructor(
    private exerciseService: ExerciseService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.filterExercises();
      },
      error: (error) => {
        console.error('Error loading exercise types', error);
        this.notificationService.show({
          type: 'error',
          title: 'Operation Failed',
          message: this.getApiErrorMessage(
            error,
            'Could not load exercise types.'
          ),
          autoCloseMs: 5000,
        });
      }
    });
  }

  filterExercises(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredExercises = [...this.exercises];
    } else {
      this.filteredExercises = this.exercises.filter((exercise) => {
        return (
          exercise.id.toString().includes(term) ||
          exercise.name.toLowerCase().includes(term)
        );
      });
    }

    this.currentPage = 1;
    this.updatePaginatedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterExercises();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredExercises.length / this.pageSize));
  }

  updatePaginatedData(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedExercises = this.filteredExercises.slice(start, end);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  openCreateModal(): void {
    if (this.saving) {
      return;
    }

    this.isEditing = false;
    this.currentExercise = this.createEmptyExercise();
    this.resetFormErrors();
    this.showModal = true;
  }

  openEditModal(exercise: Exercise): void {
    if (this.saving) {
      return;
    }

    this.isEditing = true;
    this.currentExercise = { ...exercise };
    this.resetFormErrors();
    this.showModal = true;
  }

  closeModal(force = false): void {
    if (this.saving && !force) {
      return;
    }

    this.showModal = false;
    this.resetFormErrors();
    this.currentExercise = this.createEmptyExercise();
  }

  saveExercise(): void {
    if (this.saving) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    const payload: ExercisePayload = {
      name: this.currentExercise.name.trim(),
      content_description: this.currentExercise.content_description.trim(),
    };

    const request$ = this.isEditing
      ? this.exerciseService.updateExercise(this.currentExercise.id, payload)
      : this.exerciseService.createExercise(payload);

    const successMessage = this.isEditing
      ? 'Exercise type updated successfully.'
      : 'Exercise type created successfully.';

    const errorMessage = this.isEditing
      ? 'Could not update the exercise type.'
      : 'Could not create the exercise type.';

    this.saving = true;

    request$
      .pipe(finalize(() => {
        this.saving = false;
      }))
      .subscribe({
        next: () => {
          this.closeModal(true);
          this.loadExercises();
          this.notificationService.show({
            type: 'success',
            title: 'Operation Successful',
            message: successMessage,
            autoCloseMs: 4000,
          });
        },
        error: (error) => {
          console.error('Error saving exercise type', error);
          this.notificationService.show({
            type: 'error',
            title: 'Operation Failed',
            message: this.getApiErrorMessage(error, errorMessage),
            autoCloseMs: 5000,
          });
        }
      });
  }

  openDeleteDialog(exercise: Exercise): void {
    if (this.deleting) {
      return;
    }

    this.exerciseToDelete = exercise;
    this.deleteDialogMessage =
      `Are you sure you want to delete the exercise type "${exercise.name}"? ` +
      'This action performs a soft delete and removes it from active listings.';
    this.showDeleteConfirm = true;
  }

  closeDeleteDialog(force = false): void {
    if (this.deleting && !force) {
      return;
    }

    this.showDeleteConfirm = false;
    this.exerciseToDelete = null;
    this.deleteDialogMessage = '';
  }

  confirmDelete(): void {
    if (!this.exerciseToDelete || this.deleting) {
      return;
    }

    this.deleting = true;

    this.exerciseService.deleteExercise(this.exerciseToDelete.id)
      .pipe(finalize(() => {
        this.deleting = false;
      }))
      .subscribe({
        next: () => {
          this.closeDeleteDialog(true);
          this.loadExercises();
          this.notificationService.show({
            type: 'success',
            title: 'Operation Successful',
            message: 'Exercise type deleted successfully.',
            autoCloseMs: 4000,
          });
        },
        error: (error) => {
          console.error('Error deleting exercise type', error);
          this.notificationService.show({
            type: 'error',
            title: 'Operation Failed',
            message: this.getApiErrorMessage(
              error,
              'Could not delete the exercise type.'
            ),
            autoCloseMs: 5000,
          });
        }
      });
  }

  trackByExerciseId(_index: number, exercise: Exercise): number {
    return exercise.id;
  }

  private validateForm(): boolean {
    this.resetFormErrors();

    let isValid = true;

    const normalizedName = this.currentExercise.name.trim();
    const normalizedDescription = this.currentExercise.content_description.trim();

    if (!normalizedName) {
      this.nameError = 'Name is required.';
      isValid = false;
    } else if (normalizedName.length > 255) {
      this.nameError = 'Name must not exceed 255 characters.';
      isValid = false;
    }

    if (!normalizedDescription) {
      this.contentDescriptionError = 'Content description is required.';
      isValid = false;
    }

    const duplicateActiveName = this.exercises.some((exercise) => {
      if (this.isEditing && exercise.id === this.currentExercise.id) {
        return false;
      }

      return exercise.name.trim().toLowerCase() === normalizedName.toLowerCase();
    });

    if (normalizedName && duplicateActiveName) {
      this.nameError = 'There is already an active exercise type with the same name.';
      isValid = false;
    }

    return isValid;
  }

  private resetFormErrors(): void {
    this.nameError = '';
    this.contentDescriptionError = '';
  }

  private createEmptyExercise(): Exercise {
    return {
      id: 0,
      name: '',
      content_description: '',
      date_created: null,
    };
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: string } })?.error?.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    return fallback;
  }
}
