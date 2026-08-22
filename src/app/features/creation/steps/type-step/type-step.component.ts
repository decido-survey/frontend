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
  templateUrl: './type-step.component.html'
})
export class TypeStepComponent {
  protected readonly state = inject(CreationStateService);
  protected readonly questionTypes = QUESTION_TYPES;
}