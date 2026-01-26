import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassService } from '../../services/class.service';
import { Class } from '../../interfaces/class.interface';
import { ClassFormComponent } from '../class-form/class-form.component';

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
  isLoading = true;
  errorMessage = '';
  searchText = '';
  filteredClasses: Class[] = [];

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.loadClasses();

    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.selectedClass = null;
      });
    }
  }

  loadClasses(): void {
    this.classService.getClasses().subscribe({
      next: (data: Class[]) => {
        this.classes = data;
        this.filteredClasses = data;
        this.isLoading = false;
        console.log(this.filteredClasses)
      },
      error: () => {
        this.errorMessage = 'Error loading classes';
        this.isLoading = false;
      }
    });
  }

  onClassSaved(): void {
    this.selectedClass = null;
    this.loadClasses();

    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }

  openEdit(classData: Class): void {
    this.selectedClass = classData;

    const modalEl = document.getElementById('newClassModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  deleteClass(id: number): void {
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