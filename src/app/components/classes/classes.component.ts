import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Class } from '../../interfaces/class.interface';
import { ClassService } from '../../services/class.service';
import { ClassFormComponent } from '../class-form.component/class-form.component';

@Component({
  selector: 'app-classes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClassFormComponent],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.css'
})
export class ClassesComponent implements OnInit {

  classes: Class[] = [];
  loading = false;
  showForm = false;
  editingClass: Class | null = null;


  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    this.classService.getClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openCreate(): void {
  this.editingClass = null;
  this.showForm = true;
}

openEdit(c: Class): void {
  this.editingClass = c;
  this.showForm = true;
}

saveClass(payload: Partial<Class>): void {
  if (this.editingClass) {
    this.classService.updateClass(this.editingClass.id, payload)
      .subscribe(() => this.loadClasses());
  } else {
    this.classService.createClass(payload)
      .subscribe(() => this.loadClasses());
  }

  this.showForm = false;
}

deleteClass(c: Class): void {
  if (!confirm(`¿Eliminar la clase ${c.class_code}?`)) return;

  this.classService.deleteClass(c.id).subscribe(() => {
    this.loadClasses();
  });
}
searchText = '';
allClasses: Class[] = [];

filterClasses(): void {
  const value = this.searchText.toLowerCase();

  this.classes = this.allClasses.filter(c =>
    c.class_code.toLowerCase().includes(value) ||
    c.description.toLowerCase().includes(value) ||
    c.suggested_level.toLowerCase().includes(value)
  );
}
}
