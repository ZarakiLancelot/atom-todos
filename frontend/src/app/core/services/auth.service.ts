import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

import { Session } from '../models/session.model';
import { User } from '../models/user.model';

interface ApiLoginResponse {
  user: Pick<User, 'id' | 'email'>;
  token: string;
  created: boolean;
}

interface ApiFindResponse {
  userId: string;
  email: string;
  token: string;
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
  userId = () => this.sessionSignal()?.userId ?? '';
  email = () => this.sessionSignal()?.email ?? '';
  token = () => this.sessionSignal()?.token ?? '';

  private setSession(session: Session) {
    this.sessionSignal.set(session);
    if (session) localStorage.setItem('session', JSON.stringify(session));
    else localStorage.removeItem('session');
  }

  async findUser(email: string): Promise<ApiFindResponse | null> {
    const base = environment.apiUrl.replace(/\/+$/, '');
    const params = { params: { email: email.trim().toLowerCase() } };

    console.log("Finding user with email:", email);
    console.log("API URL:", `${base}/users/find`);
    try {
      const response = await firstValueFrom(
        this.http.get<ApiFindResponse>(`${base}/users/find`, {
          params: { email }
        })
      );
      console.log("findUser response:", response);
      return response ?? null;
    } catch (e) {
      const err = e as HttpErrorResponse;
      if (err.status === 404) {
        console.log('[findUser] 404 not found (auth)');
        return null;
      }
      if (err.status !== 404 && err.status !== 405) {
        console.error('[findUser] error (auth):', err.status, err.error);
        return null;
      }
      return null;
    }

    const url = `${base}/users/find`;
    try {
      console.log('[findUser] GET', url, params);
      const res = await firstValueFrom(this.http.get<ApiFindResponse>(url, params));
      console.log('[findUser] 200 OK', res);
      return res ?? null;
    } catch (e) {
      const err = e as HttpErrorResponse;
      if (err.status === 404) {
        console.log('[findUser] 404 not found');
        return null;
      }
      console.error('[findUser] error:', err.status, err.error);
      return null;
    }
  }

  async loginOrCreate(email: string): Promise<'found' | 'created'> {
    const { user, token, created } = await firstValueFrom(
      this.http.post<ApiLoginResponse>(`${environment.apiUrl}/auth/login-or-create`, { email })
    );
    this.setSession({ userId: user.id, email: user.email, token });
    return created ? 'created' : 'found';
  }

  logout() { this.setSession(null); }
}
