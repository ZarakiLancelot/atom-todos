import { HttpClient } from '@angular/common/http';
import { computed, signal, inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get userId(): string {
    const userId = this.auth.session()?.userId ?? '';
    return userId;
  }

  private get baseUrl(): string {
    const environmentApiUrl = `${environment.apiUrl}/users/${this.userId}/todos`;
    return environmentApiUrl;
  }

  private listSignal = signal<Task[]>([]);
  tasks = computed(() =>
    [...this.listSignal()].sort((a, b) => b.createdAt - a.createdAt)
  );

  async load() {
    if (!this.userId) return;
    const data = await firstValueFrom(this.http.get<Task[]>(this.baseUrl));
    this.listSignal.set(data ?? []);
  }

  async create(dto: Pick<Task,'title' | 'description'>) {
    const created = await firstValueFrom(this.http.post<Task>(this.baseUrl, { ...dto, completed: false }));
    if (created) this.listSignal.update(arr => [created, ...arr]);
  }

  async update(id: string, changes: Partial<Task>) {
    const updated = await firstValueFrom(
      this.http.put<Task>(`${this.baseUrl}/${id}`, changes)
    );

    this.listSignal.update(arr =>
      arr.map( t => (t.id !== id ? t : ({ ...t, ...changes, ...(updated ?? {}) })))
    );
  }

  async remove(id: string) {
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    this.listSignal.update(arr => arr.filter(t => t.id !== id));
  }
}
