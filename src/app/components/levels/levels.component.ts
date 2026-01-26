import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LevelService } from '../../services/level.service';
import { Level } from '../../interfaces/level.interface';

@Component({
  selector: 'app-levels',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './levels.component.html',
  styleUrls: ['./levels.component.css']
})
export class LevelsComponent implements OnInit {

  levels: Level[] = [];
  filteredLevels: Level[] = [];
  showDeleteModal = false;
  levelToDelete: Level | null = null;

  searchTerm = '';

  showModal = false;
  isEditing = false;

  currentLevel: Level = this.createEmptyLevel();

  constructor(private levelService: LevelService) {}

  ngOnInit(): void {
    this.loadLevels();
  }

  /* =========================
     DATA
  ========================== */

  loadLevels(): void {
    this.levelService.getLevels().subscribe({
      next: (levels) => {
        this.levels = levels;
        this.filteredLevels = [...levels];
      },
      error: (err) => {
        console.error('Error loading levels', err);
      }
    });
  }

  /* =========================
     SEARCH
  ========================== */

  filterLevels(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredLevels = [...this.levels];
      return;
    }

    this.filteredLevels = this.levels.filter(level =>
      level.description.toLowerCase().includes(term)
    );
  }

  /* =========================
     MODAL
  ========================== */

  openCreateModal(): void {
    this.isEditing = false;
    this.currentLevel = this.createEmptyLevel();
    this.showModal = true;
  }

  openEditModal(level: Level): void {
    this.isEditing = true;
    this.currentLevel = { ...level };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  /* =========================
     CRUD
  ========================== */

  saveLevel(): void {
  if (!this.currentLevel.description || this.currentLevel.min_xp === undefined) {
    return;
  }

  const description = this.currentLevel.description.trim().toLowerCase();
  const minXp = this.currentLevel.min_xp;

  const duplicated = this.levels.some(level => {
    // Excluir el mismo registro cuando se edita
    if (this.isEditing && level.id === this.currentLevel.id) {
      return false;
    }

    return (
      level.description.trim().toLowerCase() === description ||
      level.min_xp === minXp
    );
  });

  if (duplicated) {
    alert('There is already a level with the same name or the same minimum experience.');
    return;
  }

  /* ==== lo que ya tenías ==== */

  if (this.isEditing) {
    this.levelService
      .updateLevel(this.currentLevel.id, this.currentLevel)
      .subscribe({
        next: () => {
          this.loadLevels();
          this.closeModal();
        },
        error: err => console.error(err)
      });
  } else {
    this.levelService.createLevel(this.currentLevel).subscribe({
      next: () => {
        this.loadLevels();
        this.closeModal();
      },
      error: err => console.error(err)
    });
  }
}


  deleteLevel(levelId: number): void {
    if (!confirm('Are you sure you want to delete this level?')) {
      return;
    }

    this.levelService.deleteLevel(levelId).subscribe({
      next: () => this.loadLevels(),
      error: err => console.error(err)
    });
  }

  /* =========================
     HELPERS
  ========================== */

  private createEmptyLevel(): Level {
    return {
      id: 0,
      description: '',
      min_xp: 0,
      cosmetic: ''
    };
  }

  clearSearch(): void {
  this.searchTerm = '';
  this.filteredLevels = [...this.levels];
}

openDeleteModal(level: Level): void {
  this.levelToDelete = level;
  this.showDeleteModal = true;
}

closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.levelToDelete = null;
}

confirmDelete(): void {
  if (!this.levelToDelete) {
    return;
  }

  this.levelService.deleteLevel(this.levelToDelete.id).subscribe({
    next: () => {
      this.loadLevels();
      this.closeDeleteModal();
    },
    error: err => console.error(err)
  });
}

getMaxXP(): number {
  if (this.levels.length === 0) {
    return 0;
  }

  return Math.max(...this.levels.map(level => level.min_xp ?? 0));
}


}
