import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';
import { MySurveySummary } from '../../models/survey.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BackLinkComponent } from '../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-my-results',
  standalone: true,
  imports: [TopbarComponent, BackLinkComponent],
  templateUrl: './my-results.component.html'
})
export class MyResultsComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  protected readonly loading = signal<boolean>(true);
  protected readonly surveys = signal<MySurveySummary[]>([]);

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.surveyService.getMySurveys().subscribe((list) => {
      this.surveys.set(list);
      this.loading.set(false);
    });
  }

  viewResults(survey: MySurveySummary): void {
    this.router.navigate(['/s', survey.responseToken, 'admin', survey.adminToken]);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}