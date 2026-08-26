import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavStateService {
  private readonly auth = inject(AuthService);

  /** Le menu est-il déplié (icônes visibles) ou réduit (un simple rond) ? */
  readonly expanded = signal<boolean>(this.auth.isLoggedIn());

  private lastLoggedIn = this.auth.isLoggedIn();

  constructor() {
    // Dès que l'état de connexion change, le menu suit automatiquement
    // (déplié à la connexion, réduit à la déconnexion). L'utilisateur peut
    // ensuite le rouvrir/refermer manuellement à tout moment, connecté ou non.
    effect(() => {
      const loggedIn = this.auth.isLoggedIn();
      if (loggedIn !== this.lastLoggedIn) {
        this.lastLoggedIn = loggedIn;
        this.expanded.set(loggedIn);
      }
    });
  }

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}