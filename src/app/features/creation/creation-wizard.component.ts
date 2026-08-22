import { Component, inject } from '@angular/core';
import { CreationStateService } from '../../services/creation-state.service';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { TypeStepComponent } from './steps/type-step/type-step.component';
import { SetupStepComponent } from './steps/setup-step/setup-step.component';
import { ThemeStepComponent } from './steps/theme-step/theme-step.component';
import { AdvancedStepComponent } from './steps/advanced-step/advanced-step.component';
import { PublishStepComponent } from './steps/publish-step/publish-step.component';

@Component({
  selector: 'app-creation-wizard',
  standalone: true,
  imports: [
    TopbarComponent,
    TypeStepComponent,
    SetupStepComponent,
    ThemeStepComponent,
    AdvancedStepComponent,
    PublishStepComponent
  ],
  template: `
    <app-topbar [activeStepIndex]="state.currentStepIndex()" />

    <section class="screen">
      @switch (state.currentStep()) {
        @case ('home') {
          <app-type-step />
        }
        @case ('setup') {
          <app-setup-step />
        }
        @case ('theme') {
          <app-theme-step />
        }
        @case ('advanced') {
          <app-advanced-step />
        }
        @case ('publish') {
          <app-publish-step />
        }
      }
    </section>
  `
})
export class CreationWizardComponent {
  protected readonly state = inject(CreationStateService);
}
