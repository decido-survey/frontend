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
  template: `
    <app-topbar [showDots]="false" />

    <section class="screen">
      <app-back-link label="créer un sondage" (clickBack)="goHome()" />

      <h1>Résultats</h1>
      
      @if (loading()) {
        <div class="sub text-center" style="margin-top: 40px;">Chargement des résultats…</div>
      } @else if (!results()) {
        <div class="demo-tag">aperçu — données d'exemple</div>
        <h1>Sondage d'exemple</h1>
        
        @for (item of demoResults.items; track item.text) {
          <app-result-bar
            [label]="item.text || ''"
            [votesCount]="item.voteCount"
            [percentage]="item.percentage"
          />
        }

        <div class="sub" style="margin-top: 14px;">
          {{ demoResults.totalVotes }} votes au total · créé par toi
        </div>
      } @else {
        <div class="preview-eyebrow" style="margin-bottom: 4px; text-transform: uppercase;">
          {{ results()?.type }}
        </div>
        <h2 class="font-bold text-xl mb-4">{{ results()?.title }}</h2>

        @if (results()?.type === 'ouverte' && results()?.openResponses?.length) {
          <div class="flex flex-col gap-3 my-4">
            @for (resp of results()?.openResponses; track $index) {
              <div class="link-card">
                <div class="font-semibold text-sm mb-1">{{ resp.text }}</div>
                <div class="opt-row-desc">— {{ resp.pseudo }}</div>
              </div>
            }
          </div>
        } @else {
          @for (item of results()?.items; track item.propositionId || $index) {
            <app-result-bar
              [label]="item.text || 'Option'"
              [votesCount]="item.voteCount"
              [percentage]="item.percentage"
            />
          }
        }

        <div class="sub" style="margin-top: 16px;">
          {{ results()?.totalVotes }} {{ results()?.totalVotes === 1 ? 'vote' : 'votes' }} au total
          · créé par {{ results()?.creatorPseudo || 'Anonyme' }}
        </div>
      }

      <button class="btn btn-primary btn-block" style="margin-top: auto;" (click)="goHome()">
        Créer un autre sondage
      </button>
    </section>
  `
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
