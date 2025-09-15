import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { TaskFormComponent } from '../../shared/components/task-form.component';
import { TaskCardComponent } from '../../shared/components/task-card.component';
import { TasksService, Task } from '../../core/services/tasks.service';
import { ConfirmDialog } from '../../shared/dialogs/confirm.dialog';

@Component({
  standalone: true,
  selector: 'app-tasks',
  imports: [CommonModule, TaskFormComponent, TaskCardComponent,
    MatToolbarModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit {
  private router = inject(Router);
  private tasksSvc = inject(TasksService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  loading = signal(true);
  tasks = this.tasksSvc.tasks;
  editTask = signal<Task | null>(null);

  async ngOnInit() {
    try {
      await this.tasksSvc.load();
    } catch {
      this.snack.open('No se pudieron cargar las tareas', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(val: { title: string; description?: string }) {
    try {
      if (this.editTask()) {
        await this.tasksSvc.update(this.editTask()!.id, val);
        this.editTask.set(null);
        this.snack.open('Tarea actualizada', 'OK', { duration: 3000 });
      } else {
        await this.tasksSvc.create(val);
        this.snack.open('Tarea agregada', 'OK', { duration: 3000 });
      }
    } catch {
      this.snack.open('Error guardando tarea', 'Cerrar', { duration: 3000 });
    }
  }

  async toggle(id: string, completed: boolean) {
    try {
      await this.tasksSvc.update(id, { completed });
    } catch {
      this.snack.open('No se pudo actualizar el estado', 'Cerrar', { duration: 3000 });
    }
  }

  toggleStatus(id: string, completed: boolean) {
    return this.toggle(id, completed);
  }

  async remove(id: string) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: '¿Eliminar tarea?',
        message: '¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    const ok = await firstValueFrom(ref.afterClosed());
    if (!ok) return;

    try {
      await this.tasksSvc.remove(id);
      this.snack.open('Tarea eliminada', 'OK', { duration: 3000 });
    } catch {
      this.snack.open('No se pudo eliminar la tarea', 'Cerrar', { duration: 3000 });
    }
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }

  trackById(_i: number, t: Task) { return t.id; }
}
