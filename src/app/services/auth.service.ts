import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  pseudo: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoggedIn = signal<boolean>(false);

  /**
   * Simulated login — à remplacer par un appel API réel.
   */
  login(pseudo: string, email: string, _password: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: AuthUser = {
          id: Math.random().toString(36).substring(2, 9),
          pseudo,
          email
        };
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('decido_user', JSON.stringify(user));
        }
        resolve();
      }, 300);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('decido_user');
    }
  }

  /** Restaure la session depuis localStorage au démarrage. */
  restoreSession(): void {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('decido_user');
      if (raw) {
        try {
          const user = JSON.parse(raw) as AuthUser;
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
        } catch {
          // invalid data
        }
      }
    }
  }
}
