import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreationStateService } from '../../services/creation-state.service';
import { SurveyService } from '../../services/survey.service';
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
  templateUrl: './creation-wizard.component.html'
})
export class CreationWizardComponent implements OnInit {
  protected readonly state = inject(CreationStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  ngOnInit(): void {
    const surveyId = this.route.snapshot.paramMap.get('surveyId');
    if (!surveyId) {
      this.state.reset();
      return;
    }
    this.surveyService.getMySurveyById(surveyId).subscribe((survey) => {
      if (survey) {
        this.state.loadForEdit(survey, surveyId, survey.adminToken || '');
      } else {
        this.router.navigate(['/mes-sondages']);
      }
    });
  }
}