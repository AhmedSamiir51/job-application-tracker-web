import { Injectable, computed, signal } from '@angular/core';
import { AuthResponse, User } from './models';

const STORAGE_KEY = 'jobtracker.session';

interface Session {
  accessToken: string;
  expiresAtUtc: string;
  user: User;
}

/** Holds the signed-in user and JWT. Persisted in localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly sessionSignal = signal<Session | null>(this.read());

  readonly user = computed(() => this.sessionSignal()?.user ?? null);
  readonly isAuthenticated = computed(() => {
    const session = this.sessionSignal();
    return !!session && new Date(session.expiresAtUtc).getTime() > Date.now();
  });

  get accessToken(): string | null {
    return this.isAuthenticated() ? this.sessionSignal()!.accessToken : null;
  }

  signIn(response: AuthResponse): void {
    const session: Session = {
      accessToken: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
      user: response.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.sessionSignal.set(session);
  }

  signOut(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sessionSignal.set(null);
  }

  private read(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
