import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface TaskLike { id?: string; title?: string; description?: string };

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss'
})
export class TaskFormComponent {
  @Input() set task(value: TaskLike | null) {
    this.taskId = value?.id ?? null;
    this.form.reset({
      title: value?.title ?? '',
      description: value?.description ?? ''
    }, { emitEvent: false });
  }

  @Output() submitted = new EventEmitter<{ title: string; description?: string}>();
  @Output() cancelled = new EventEmitter<void>();

  taskId: string | null = null;
  submitting = false;

  private fb = new FormBuilder();
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
  });

  get titleCtrl() { return this.form.controls.title; }
  get descriptionCtrl() { return this.form.controls.description; }

  async onCancel() {
    this.form.reset();
    this.cancelled.emit();
  }

  async onSubmit() {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;

    try {
      const payload = this.form.value as { title: string; description?: string };
      this.submitted.emit(payload);

      if (!this.taskId) {
        this.form.reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      this.submitting = false;
    }
  }
}
