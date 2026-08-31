import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { CreationWizardComponent } from './features/creation/creation-wizard.component';
import { SurveyVoteComponent } from './features/vote/survey-vote.component';
import { SurveyResultsComponent } from './features/results/survey-results.component';
import { MySurveysComponent } from './features/my-surveys/my-surveys.component';
import { MyResultsComponent } from './features/my-results/my-results.component';
  

export const routes: Routes = [
  // Landing
  {
    path: '',
    component: LandingComponent,
    title: 'Decido – Sondages instantanés'
  },

  // Wizard de création
  {
    path: 'create',
    component: CreationWizardComponent,
    title: 'Créer un sondage – Decido'
  },
  {
    path: 'create/:surveyId',
    component: CreationWizardComponent,
    title: 'Modifier un sondage – Decido'
  },

  // Page de vote (répondants)
  {
    path: 's/:token',
    component: SurveyVoteComponent,
    title: 'Voter – Decido'
  },

  // Résultats publics
  {
    path: 's/:token/results',
    component: SurveyResultsComponent,
    title: 'Résultats – Decido'
  },

  // Dashboard admin
  {
    path: 's/:token/admin/:adminToken',
    component: SurveyResultsComponent,
    title: 'Administration – Decido'
  },
    {
    path: 'mes-sondages',
    component: MySurveysComponent,
    title: 'Mes sondages – Decido'
  },
  {
    path: 'mes-resultats',
    component: MyResultsComponent,
    title: 'Mes résultats – Decido'
  },
  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
