import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TaskFormComponent } from '../../shared/components/task-form.component';
import { TaskCardComponent } from '../../shared/components/task-card.component';

import { TasksService, Task } from '../../core/services/tasks.service';

@Component({
  standalone: true,
  selector: 'app-tasks',
  imports: [CommonModule, TaskFormComponent, TaskCardComponent],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  private router = inject(Router);
  private tasksSvc = inject(TasksService);

  loading = signal(true);
  tasks = this.tasksSvc.tasks;
  editTask = signal<Task | null>(null);

  async ngOnInit() {
    try {
      await this.tasksSvc.load();
    } catch (err) {
      console.error('Error loading tasks', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(val: { title: string; description?: string }) {
    console.log('Form submitted with:', val);
    try {
      if (this.editTask()) {
        console.log('Editing task:', this.editTask()!.id);
        await this.tasksSvc.update(this.editTask()!.id, val);
        this.editTask.set(null);
      } else {
        console.log('Creating new task');
        await this.tasksSvc.create(val);
      }
    } catch (err) {
      console.error('Error saving task', err);
    }
  }

  async toggle(id: string, completed: boolean) {
    try {
      await this.tasksSvc.update(id, { completed });
    } catch (err) {
      console.error('Error toggling task', err);
    }
  }

  toggleStatus(id: string, completed: boolean) {
    return this.toggle(id, completed);
  }

  async remove(id: string) {
    const ok = confirm('¿Eliminar tarea?');
    if (!ok) return;
    try {
      await this.tasksSvc.remove(id);
    } catch (err) {
      console.error('Error removing task', err);
    }
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  trackById(_i: number, t: Task) { return t.id; }
}
