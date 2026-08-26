import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import {
  LucidePlus,
  LucideFolderOpen,
  LucideBarChart2,
  LucideMenu,
  LucideX,
  LucideLink2
} from '@lucide/angular';
import { NavStateService } from '../../../services/nav-state.service';
import { AuthService } from '../../../services/auth.service';

type LinkPromptMode = 'sondages' | 'resultats' | null;

@Component({
  selector: 'app-nav-rail',
  standalone: true,
  imports: [LucidePlus, LucideFolderOpen, LucideBarChart2, LucideMenu, LucideX, LucideLink2],
  templateUrl: './nav-rail.component.html',
  styleUrl: './nav-rail.component.css'
})
export class NavRailComponent {
  protected readonly navState = inject(NavStateService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly currentUrl = signal(this.router.url);

  protected readonly isLandingPage = computed(() => this.currentUrl() === '/');
  protected readonly isOnCreate = computed(() => this.currentUrl().startsWith('/create'));
  protected readonly isOnMySurveys = computed(() => this.currentUrl().startsWith('/mes-sondages'));
  protected readonly isOnMyResults = computed(() => this.currentUrl().startsWith('/mes-resultats'));

  protected readonly linkPromptMode = signal<LinkPromptMode>(null);
  protected readonly linkInput = signal<string>('');
  protected readonly linkError = signal<string | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));
  }

  toggle(): void {
    this.navState.toggle();
  }

  onCreateClick(): void {
    if (this.isOnCreate()) return;
    this.router.navigate(['/create']);
  }

  onMySurveysClick(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/mes-sondages']);
    } else {
      this.openLinkPrompt('sondages');
    }
  }

  onMyResultsClick(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/mes-resultats']);
    } else {
      this.openLinkPrompt('resultats');
    }
  }

  private openLinkPrompt(mode: LinkPromptMode): void {
    this.linkPromptMode.set(mode);
    this.linkInput.set('');
    this.linkError.set(null);
  }

  closeLinkPrompt(): void {
    this.linkPromptMode.set(null);
  }

  onLinkInputChange(event: Event): void {
    this.linkInput.set((event.target as HTMLInputElement).value);
  }

  submitLinkPrompt(): void {
    const raw = this.linkInput().trim();
    if (!raw) {
      this.linkError.set('Colle un lien pour continuer.');
      return;
    }
    const parsed = this.parseSurveyLink(raw);
    if (!parsed) {
      this.linkError.set("Ce lien ne semble pas valide. Colle le lien complet reçu à la création.");
      return;
    }
    this.closeLinkPrompt();
    if (parsed.adminToken) {
      this.router.navigate(['/s', parsed.token, 'admin', parsed.adminToken]);
    } else {
      this.router.navigate(['/s', parsed.token, 'results']);
    }
  }

  private parseSurveyLink(raw: string): { token: string; adminToken?: string } | null {
    try {
      const path = raw.includes('://') ? new URL(raw).pathname : raw;
      const match = path.match(/\/s\/([^/]+)(?:\/admin\/([^/]+))?/);
      if (!match) return null;
      return { token: match[1], adminToken: match[2] };
    } catch {
      return null;
    }
  }
}