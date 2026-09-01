import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { QUESTION_TYPES, SurveyTypeId } from '../../../../models/question-type.model';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { OptionRowComponent } from '../../../../shared/components/option-row/option-row.component';
import { Router } from '@angular/router';
import { NoteScale } from '../../../../models/survey.model';

@Component({
  selector: 'app-setup-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent, OptionRowComponent],
  templateUrl: './setup-step.component.html'
})
export class SetupStepComponent {
  protected readonly state = inject(CreationStateService);
  protected readonly letters = 'ABCDEFGH';
  private readonly router = inject(Router);

  currentTypeName(): string {
    const type = this.state.selectedType();
    const found = QUESTION_TYPES.find((t) => t.id === type);
    return found ? found.name : '';
  }

  placeholderQ(): string {
    const type = this.state.selectedType();
    const map: Record<SurveyTypeId, string> = {
      qcm: 'On mange quoi ce midi ?',
      duel: 'Pizza ou sushi ce soir ?',
      note: 'On est chaud à combien pour sortir ?',
      ouverte: 'Une idée de nom pour le projet ?'
    };
    return type ? map[type] : 'Pose ta question…';
  }

  protected readonly noteScaleOptions: NoteScale[] = [3, 5, 10, 20];

  onQuestionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.state.questionText.set(target.value);
  }

  onCreatorInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.state.creatorPseudo.set(target.value);
  }

    protected backLabel(): string {
    return this.state.isEditing ? 'annuler la modification' : 'changer de type (' + this.currentTypeName() + ')';
  }

  protected onBack(): void {
    if (this.state.isEditing) {
      this.router.navigate(['/mes-sondages']);
    } else {
      this.state.goToStep('home');
    }
  }
}