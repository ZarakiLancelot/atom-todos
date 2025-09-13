import { HttpClient } from '@angular/common/http';
import { computed, signal, inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get userId(): string {
    const userId = this.auth.session()?.userId ?? '';
    console.log('TasksService - userId:', userId);
    return userId;
  }

  private get baseUrl(): string {
    const environmentApiUrl = `${environment.apiUrl}/users/${this.userId}/todos`;
    console.log('TasksService - baseUrl:', environmentApiUrl);
    return environmentApiUrl;
  }

  private listSignal = signal<Task[]>([]);
  tasks = computed(() =>
    [...this.listSignal()].sort((a, b) => b.createdAt - a.createdAt)
  );

  async load() {
    if (!this.userId) return;
    console.log('[TasksService] GET', this.baseUrl);
    const data = await firstValueFrom(this.http.get<Task[]>(this.baseUrl));
    this.listSignal.set(data ?? []);
  }

  async create(dto: Pick<Task,'title'|'description'>) {
    console.log('[TasksService] POST', this.baseUrl, dto);
    const created = await firstValueFrom(this.http.post<Task>(this.baseUrl, { ...dto, completed: false }));
    if (created) this.listSignal.update(arr => [created, ...arr]);
  }

  async update(id: string, changes: Partial<Task>) {
    console.log('[TasksService] PUT', `${this.baseUrl}/${id}`, changes);
    const updated = await firstValueFrom(this.http.put<Task>(`${this.baseUrl}/${id}`, changes));
    if (updated) this.listSignal.update(arr => arr.map(t => t.id === id ? updated : t));
  }

  async remove(id: string) {
    console.log('[TasksService] DELETE', `${this.baseUrl}/${id}`);
    await firstValueFrom(this.http.delete(`${this.baseUrl}/${id}`));
    this.listSignal.update(arr => arr.filter(t => t.id !== id));
  }
}
