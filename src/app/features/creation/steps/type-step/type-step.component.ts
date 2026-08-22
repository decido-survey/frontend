import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-type-step',
  standalone: true,
  imports: [
    LucideList,
    LucideSwords,
    LucideStar,
    LucideMessageSquare,
    LucideAlignLeft,
    LucideCheck,
    BackLinkComponent
  ],
  templateUrl: './type-step.component.html'
})
export class TypeStepComponent {
  protected readonly state = inject(CreationStateService);
  protected readonly questionTypes = QUESTION_TYPES;
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }
}