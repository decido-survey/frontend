import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { QUESTION_TYPES } from '../../../../models/question-type.model';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-theme-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent],
  template: `
    <app-back-link label="retour" (clickBack)="state.goToStep('setup')" />

    <h1>Ton style</h1>
    <div class="sub">Choisi automatiquement selon le type — change-le si tu veux</div>

    <!-- Preview Card -->
    <div class="preview-card">
      <div class="preview-eyebrow">{{ currentTypeName() }}</div>
      <div class="preview-q">{{ state.questionText() || defaultQuestion() }}</div>

      <!-- Preview Options -->
      @if (state.selectedType() === 'ouverte') {
        <div class="preview-opt">💬 réponse libre…</div>
      } @else if (state.selectedType() === 'note') {
        <div class="preview-opt">★ échelle de 1 à 5</div>
      } @else {
        @for (opt of filledOptions(); track $index) {
          <div class="preview-opt">{{ opt }}</div>
        }
      }

      <div class="preview-by">créé par {{ state.creatorPseudo() || 'toi' }}</div>
    </div>

    <!-- Color Swatches -->
    <div class="swatches">
      @for (c of currentPalettes(); track $index) {
        <div
          class="swatch"
          [class.active]="$index === state.themeIdx()"
          [style.backgroundColor]="c"
          (click)="state.setThemeIndex($index)"
        ></div>
      }
    </div>

    <div class="btn-row" style="margin-top: auto;">
      <button class="btn btn-primary btn-block" (click)="state.goToStep('advanced')">
        <span>Continuer</span>
        <svg lucideChevronRight class="w-4 h-4 stroke-[2.5]"></svg>
      </button>
    </div>
  `
})
export class ThemeStepComponent {
  protected readonly state = inject(CreationStateService);

  currentTypeName(): string {
    const type = this.state.selectedType();
    const found = QUESTION_TYPES.find((t) => t.id === type);
    return found ? found.name : '';
  }

  currentPalettes(): string[] {
    const type = this.state.selectedType();
    const found = QUESTION_TYPES.find((t) => t.id === type);
    return found ? found.palettes : ['#7C5CFC'];
  }

  defaultQuestion(): string {
    return 'Votre question de sondage';
  }

  filledOptions(): string[] {
    const filled = this.state.options().filter((o) => o.trim().length > 0);
    return filled.length > 0 ? filled.slice(0, 4) : ['Option A', 'Option B'];
  }
}
