import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Class } from '../../interfaces/class.interface';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-form.component.html',
  styleUrl: './class-form.component.css'
})
export class ClassFormComponent {

  @Input() isEdit = false;
  @Input() set classData(value: Class | null) {
    if (value) {
      this.form = { ...value };
    }
  }

  @Output() save = new EventEmitter<Partial<Class>>();
  @Output() cancel = new EventEmitter<void>();

  form: Partial<Class> = {};

  submit(): void {
    this.save.emit(this.form);
  }

  close(): void {
    this.cancel.emit();
  }
}
