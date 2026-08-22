import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { SurveyResults } from '../../models/survey.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BackLinkComponent } from '../../shared/components/back-link/back-link.component';
import { ResultBarComponent } from '../../shared/components/result-bar/result-bar.component';

@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [TopbarComponent, BackLinkComponent, ResultBarComponent],
  templateUrl: './survey-results.component.html'
})
export class SurveyResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  protected readonly loading = signal<boolean>(true);
  protected readonly results = signal<SurveyResults | null>(null);

  protected readonly demoResults: SurveyResults = {
    surveyId: 'demo',
    title: 'On mange quoi ce midi ?',
    type: 'qcm',
    creatorPseudo: 'Marie',
    totalVotes: 42,
    items: [
      { propositionId: '1', text: 'Pizza Neopolitaine', voteCount: 24, percentage: 57 },
      { propositionId: '2', text: 'Sushi Box', voteCount: 12, percentage: 29 },
      { propositionId: '3', text: 'Salade Bar', voteCount: 6, percentage: 14 }
    ]
  };

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.surveyService.getResults(token).subscribe((data) => {
        this.loading.set(false);
        this.results.set(data);
      });
    } else {
      this.loading.set(false);
    }
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}