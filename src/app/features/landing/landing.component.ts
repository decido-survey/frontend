import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideChevronRight, LucideZap, LucideShare2, LucideBarChart2, LucideLock } from '@lucide/angular';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TypesCarouselComponent } from '../../shared/components/types-carousel/types-carousel.component';
import { FaqComponent } from '../../shared/components/faq/faq.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LucideChevronRight,
    LucideZap,
    LucideShare2,
    LucideBarChart2,
    LucideLock,
    TopbarComponent,
    FooterComponent,
    FaqComponent,
    TypesCarouselComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentYear = new Date().getFullYear();

  // --- Effet machine à écrire sur "Décide. Vite." ---
  private readonly LINE1 = 'Décide.';
  private readonly LINE2 = 'Vite.';
  private readonly TOTAL_CHARS = this.LINE1.length + this.LINE2.length;

  private readonly TYPE_DELAY = 75; // ms entre chaque caractère tapé
  private readonly ERASE_DELAY = 40; // ms entre chaque caractère effacé
  private readonly PAUSE_AFTER_TYPE = 3000; // pause une fois le texte complet
  private readonly PAUSE_AFTER_ERASE = 500; // pause une fois tout effacé

  protected readonly revealCount = signal(0);

  protected readonly line1Revealed = computed(() =>
    this.LINE1.slice(0, Math.min(this.revealCount(), this.LINE1.length))
  );
  protected readonly line2Revealed = computed(() =>
    this.LINE2.slice(0, Math.max(0, Math.min(this.revealCount() - this.LINE1.length, this.LINE2.length)))
  );

  // Texte de la ligne sans le point final (le point est rendu séparément en accent)
  protected readonly line1Base = computed(() => this.withoutTrailingDot(this.line1Revealed(), this.LINE1));
  protected readonly line1Dot = computed(() => this.trailingDot(this.line1Revealed(), this.LINE1));
  protected readonly line2Base = computed(() => this.withoutTrailingDot(this.line2Revealed(), this.LINE2));
  protected readonly line2Dot = computed(() => this.trailingDot(this.line2Revealed(), this.LINE2));

  // Sur quelle ligne se trouve le curseur en ce moment
  protected readonly activeLine = computed(() => (this.revealCount() <= this.LINE1.length ? 1 : 2));

  private typewriterTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Pas d'animation : on affiche directement le texte complet
      this.revealCount.set(this.TOTAL_CHARS);
    } else {
      this.scheduleTyping();
      this.destroyRef.onDestroy(() => {
        if (this.typewriterTimeout) {
          clearTimeout(this.typewriterTimeout);
        }
      });
    }
  }

  private withoutTrailingDot(revealed: string, full: string): string {
    return revealed.length === full.length ? revealed.slice(0, -1) : revealed;
  }

  private trailingDot(revealed: string, full: string): string {
    return revealed.length === full.length ? '.' : '';
  }

  private scheduleTyping(): void {
    if (this.revealCount() < this.TOTAL_CHARS) {
      this.typewriterTimeout = setTimeout(() => {
        this.revealCount.update((v) => v + 1);
        this.scheduleTyping();
      }, this.TYPE_DELAY);
    } else {
      this.typewriterTimeout = setTimeout(() => this.scheduleErasing(), this.PAUSE_AFTER_TYPE);
    }
  }

  private scheduleErasing(): void {
    if (this.revealCount() > 0) {
      this.typewriterTimeout = setTimeout(() => {
        this.revealCount.update((v) => v - 1);
        this.scheduleErasing();
      }, this.ERASE_DELAY);
    } else {
      this.typewriterTimeout = setTimeout(() => this.scheduleTyping(), this.PAUSE_AFTER_ERASE);
    }
  }

  start(): void {
    this.router.navigate(['/create']);
  }
}