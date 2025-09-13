import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  @Input() set task(value: { id?: string; title?: string; description?: string } | null) {
    this.taskId = value?.id ?? null;
    this.form.reset({
      title: value?.title ?? '',
      description: value?.description ?? ''
    });
  }

  @Output() submitted = new EventEmitter<{ title: string; description?: string}>();
  @Output() cancelled = new EventEmitter<void>();

  taskId: string | null = null

  private fb = new FormBuilder();
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  get titleCtrl() { return this.form.controls.title; }
  get descriptionCtrl() { return this.form.controls.description; }

  cancel() {
    this.form.reset();
    this.cancelled.emit();
  }

  save() {
    if (this.form.valid) {
      this.form.markAllAsTouched();
      this.form.reset();
      return;
    }
    this.submitted.emit(this.form.value as unknown as { title: string; description?: string });
  }
}
