import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export type Session = { userId: string; token: string; email: string } | null;

interface ApiLoginResponse {
  user: { id: string; email: string };
  token: string;
  created: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private sessionSignal = signal<Session>(null);

  constructor() {
    const session = localStorage.getItem('session');
    if (session) {
      this.sessionSignal.set(JSON.parse(session));
    }
  }

  session = () => this.sessionSignal();
  isLoggedIn = () => !!this.sessionSignal();

  private setSession(session: Session) {
    this.sessionSignal.set(session);
    if (session) localStorage.setItem('session', JSON.stringify(session));
    else localStorage.removeItem('session');
  }

  async loginOrCreate(email: string): Promise<'found' | 'created'> {
    const { user, token, created } = await firstValueFrom(
      this.http.post<ApiLoginResponse>(`${environment.apiUrl}/auth/login-or-create`, { email })
    );
    this.setSession({ userId: user.id, email: user.email, token });
    return created ? 'created' : 'found';
  }

  logout() { this.setSession(null); }
  token() { return this.sessionSignal()?.token ?? ''; }
}
