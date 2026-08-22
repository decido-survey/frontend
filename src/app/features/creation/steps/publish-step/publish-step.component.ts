import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideCheck } from '@lucide/angular';
import { CreationStateService } from '../../../../services/creation-state.service';
import { SurveyService } from '../../../../services/survey.service';
import { BackLinkComponent } from '../../../../shared/components/back-link/back-link.component';
import { LinkCardComponent } from '../../../../shared/components/link-card/link-card.component';
import { Survey } from '../../../../models/survey.model';

@Component({
  selector: 'app-publish-step',
  standalone: true,
  imports: [LucideCheck, BackLinkComponent, LinkCardComponent],
  template: `
    <app-back-link label="retour" (clickBack)="state.goToStep('advanced')" />

    <div class="big-check">
      <svg lucideCheck class="w-8 h-8 text-white stroke-[3]"></svg>
    </div>

    <h1 class="text-center">Publié 🎉</h1>
    <div class="sub text-center">Ton sondage est en ligne, deux liens à garder :</div>

    <app-link-card
      label="Lien à partager"
      [url]="state.shareLink()"
      [isAdmin]="false"
    />

    <app-link-card
      label="Ton lien pour voir les résultats & modifier"
      [url]="state.adminLink()"
      [isAdmin]="true"
      note="Gardé automatiquement sur ce navigateur. Si tu supprimes une option déjà votée, ses votes restent visibles en 'orphelins' dans les résultats."
    />

    <button class="btn btn-block" style="margin-top: 8px;" (click)="viewResults()">
      Voir un aperçu des résultats →
    </button>
    
    <button class="btn btn-ghost btn-block" style="margin-top: 10px;" (click)="state.reset()">
      Créer un autre sondage
    </button>
  `
})
export class PublishStepComponent implements OnInit {
  protected readonly state = inject(CreationStateService);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.state.shareLink()) {
      const type = this.state.selectedType() || 'qcm';
      const props = this.state.options()
        .filter((o) => o.trim().length > 0)
        .map((text, idx) => ({
          text,
          orderIndex: idx + 1
        }));

      const newSurvey: Partial<Survey> = {
        title: this.state.questionText() || 'Sondage sans titre',
        type,
        creatorPseudo: this.state.creatorPseudo() || 'Anonyme',
        settings: {
          duration: this.state.duration(),
          resultsVisibility: this.state.publicResults() ? 'public' : 'private',
          oneVotePerDevice: this.state.oneVotePerDevice()
        },
        question: {
          text: this.state.questionText(),
          propositions: props
        }
      };

      this.surveyService.createSurvey(newSurvey).subscribe((res) => {
        this.state.shareLink.set(res.shareUrl);
        this.state.adminLink.set(res.adminUrl);
        this.state.responseToken.set(res.responseToken);
        this.state.adminToken.set(res.adminToken);
      });
    }
  }

  viewResults(): void {
    const respToken = this.state.responseToken();
    const admToken = this.state.adminToken();
    if (respToken && admToken) {
      this.router.navigate(['/s', respToken, 'admin', admToken]);
    } else {
      this.router.navigate(['/s', 'demo', 'results']);
    }
  }
}
