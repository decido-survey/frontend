import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { QUESTION_TYPES } from '../../../../models/question-type.model';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-theme-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent],
  templateUrl: './theme-step.component.html'
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