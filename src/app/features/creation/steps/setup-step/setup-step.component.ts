import { Component, inject } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { QUESTION_TYPES, SurveyTypeId } from '../../../../models/question-type.model';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { OptionRowComponent } from '../../../../shared/components/option-row/option-row.component';

@Component({
  selector: 'app-setup-step',
  standalone: true,
  imports: [LucideChevronRight, BackLinkComponent, OptionRowComponent],
  template: `
    <app-back-link
      [label]="'changer de type (' + currentTypeName() + ')'"
      (clickBack)="state.goToStep('home')"
    />

    <h1>Ta question</h1>

    <label class="field-label">Question</label>
    <textarea
      rows="2"
      [placeholder]="placeholderQ()"
      [value]="state.questionText()"
      (input)="onQuestionInput($event)"
    ></textarea>

    <!-- Options Section according to Question Type -->
    @if (state.selectedType() === 'ouverte') {
      <div class="hint-box" style="margin-top: 16px;">
        Pas d'options à définir — chacun écrira sa réponse librement.
      </div>
    } @else if (state.selectedType() === 'note') {
      <label class="field-label">Échelle de notation</label>
      <div class="note-scale">
        <div class="num">1</div>
        <div class="track"></div>
        <div class="num">5</div>
      </div>
    } @else {
      <label class="field-label">Réponses</label>

      @for (opt of state.options(); track $index) {
        <app-option-row
          [letter]="letters[$index]"
          [value]="opt"
          [placeholder]="'Option ' + letters[$index]"
          [removable]="state.selectedType() !== 'duel' && state.options().length > 2"
          (valueChange)="state.updateOption($index, $event)"
          (remove)="state.removeOption($index)"
        />
      }

      @if (state.selectedType() !== 'duel' && state.options().length < 8) {
        <div class="add-opt" (click)="state.addOption()">+ ajouter une option</div>
      }
    }

    <label class="field-label" style="margin-top: 16px;">Ton pseudo (affiché comme créateur)</label>
    <input
      type="text"
      placeholder="ex : Marie"
      [value]="state.creatorPseudo()"
      (input)="onCreatorInput($event)"
    />

    <div class="btn-row" style="margin-top: 22px;">
      <button
        class="btn btn-primary btn-block"
        [disabled]="!state.canContinueSetup()"
        (click)="state.goToStep('theme')"
      >
        <span>Continuer</span>
        <svg lucideChevronRight class="w-4 h-4 stroke-[2.5]"></svg>
      </button>
    </div>
  `
})
export class SetupStepComponent {
  protected readonly state = inject(CreationStateService);
  protected readonly letters = 'ABCDEFGH';

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
      libre: 'Quelle destination pour le voyage ?',
      ouverte: 'Une idée de nom pour le projet ?'
    };
    return type ? map[type] : 'Pose ta question…';
  }

  onQuestionInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.state.questionText.set(target.value);
  }

  onCreatorInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.state.creatorPseudo.set(target.value);
  }
}
