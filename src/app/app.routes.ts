import { Routes } from '@angular/router';
import { CreationWizardComponent } from './features/creation/creation-wizard.component';
import { SurveyVoteComponent } from './features/vote/survey-vote.component';
import { SurveyResultsComponent } from './features/results/survey-results.component';

export const routes: Routes = [
  {
    path: '',
    component: CreationWizardComponent
  },
  {
    path: 's/:token',
    component: SurveyVoteComponent
  },
  {
    path: 's/:token/admin/:adminToken',
    component: SurveyResultsComponent
  },
  {
    path: 's/:token/results',
    component: SurveyResultsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
