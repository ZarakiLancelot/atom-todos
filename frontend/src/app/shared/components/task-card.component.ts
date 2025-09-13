import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../core/services/tasks.service';

@Component({
  standalone: true,
  selector: 'app-task-card',
  imports: [CommonModule, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  @Output() statusChange = new EventEmitter<boolean>();
  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  onToggle(checked: boolean) {
    this.statusChange.emit(checked);
  }
}
