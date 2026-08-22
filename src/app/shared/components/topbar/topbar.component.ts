import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideUser, LucideLogOut, LucideSettings, LucideChevronDown } from '@lucide/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, LucideUser, LucideLogOut, LucideSettings, LucideChevronDown],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly elRef = inject(ElementRef);

  protected readonly menuOpen = signal<boolean>(false);
  protected readonly loginMode = signal<boolean>(false);
  protected readonly loginPseudo = signal<string>('');
  protected readonly loginEmail = signal<string>('');
  protected readonly loginPassword = signal<string>('');
  protected readonly loginLoading = signal<boolean>(false);
  protected readonly loginError = signal<string | null>(null);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
    this.loginMode.set(false);
    this.loginError.set(null);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.loginMode.set(false);
  }

  showLogin(): void {
    this.loginMode.set(true);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }

  async submitLogin(): Promise<void> {
    if (!this.loginPseudo().trim()) {
      this.loginError.set('Le pseudo est requis.');
      return;
    }
    this.loginLoading.set(true);
    this.loginError.set(null);
    try {
      await this.auth.login(
        this.loginPseudo().trim(),
        this.loginEmail().trim(),
        this.loginPassword()
      );
      this.closeMenu();
    } catch {
      this.loginError.set('Connexion échouée, vérifie tes informations.');
    } finally {
      this.loginLoading.set(false);
    }
  }

  /** Close dropdown when clicking outside */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
      this.loginMode.set(false);
    }
  }
}
