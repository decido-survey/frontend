import { Component, inject } from '@angular/core';
import {
  LucideList,
  LucideSwords,
  LucideStar,
  LucideMessageSquare,
  LucideAlignLeft,
  LucideCheck
} from '@lucide/angular';
import { QUESTION_TYPES, SurveyTypeId } from '../../../../models/question-type.model';
import { CreationStateService } from '../../../../services/creation-state.service';

@Component({
  selector: 'app-type-step',
  standalone: true,
  imports: [
    LucideList,
    LucideSwords,
    LucideStar,
    LucideMessageSquare,
    LucideAlignLeft,
    LucideCheck
  ],
  template: `
    <h1>Décide.<br />Vite.</h1>
    <div class="sub">Choisis comment tu veux trancher</div>

    <div class="type-grid">
      @for (type of questionTypes; track type.id) {
        <button
          class="type-card"
          [class.pressed]="state.selectedType() === type.id"
          (click)="state.selectType(type.id)"
        >
          <div class="type-icon" [style.backgroundColor]="type.color">
            @switch (type.id) {
              @case ('qcm') {
                <svg lucideList class="w-4 h-4 text-ink stroke-[2.4]"></svg>
              }
              @case ('duel') {
                <svg lucideSwords class="w-4 h-4 text-ink stroke-[2.4]"></svg>
              }
              @case ('note') {
                <svg lucideStar class="w-4 h-4 text-ink stroke-[2.4]"></svg>
              }
              @case ('libre') {
                <svg lucideMessageSquare class="w-4 h-4 text-ink stroke-[2.4]"></svg>
              }
              @case ('ouverte') {
                <svg lucideAlignLeft class="w-4 h-4 text-ink stroke-[2.4]"></svg>
              }
            }
          </div>

          <div>
            <div class="type-name">{{ type.name }}</div>
            <div class="type-desc">{{ type.desc }}</div>
          </div>

          @if (state.selectedType() === type.id) {
            <div class="absolute top-3 right-3 bg-ink text-white p-0.5 rounded-full">
              <svg lucideCheck class="w-3 h-3 stroke-[3]"></svg>
            </div>
          }
        </button>
      }
    </div>
  `
})
export class TypeStepComponent {
  protected readonly state = inject(CreationStateService);
  protected readonly questionTypes = QUESTION_TYPES;
}
