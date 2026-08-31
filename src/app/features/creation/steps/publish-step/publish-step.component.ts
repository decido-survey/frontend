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
  templateUrl: './publish-step.component.html'
})
export class PublishStepComponent implements OnInit {
  protected readonly state = inject(CreationStateService);
  private readonly surveyService = inject(SurveyService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.state.isEditing) {
      this.saveEdits();
      return;
    }
    if (!this.state.shareLink()) {
      // … logique de création existante, inchangée …
    }
  }

  private saveEdits(): void {
    const surveyId = this.state.editingSurveyId();
    if (!surveyId) return;

    const type = this.state.selectedType() || 'qcm';
    const props = this.state.options()
      .filter((o) => o.trim().length > 0)
      .map((text, idx) => ({ text, orderIndex: idx + 1 }));

    this.surveyService.updateMySurvey(surveyId, {
      title: this.state.questionText() || 'Sondage sans titre',
      type,
      creatorPseudo: this.state.creatorPseudo() || 'Anonyme',
      settings: {
        duration: this.state.duration(),
        resultsVisibility: this.state.publicResults() ? 'public' : 'private',
        oneVotePerDevice: this.state.oneVotePerDevice()
      },
      style: { themeIdx: this.state.themeIdx(), colorHex: '' },
      question: {
        text: this.state.questionText(),
        propositions: props
      }
    }).subscribe();
  }

  goToMySurveys(): void {
    this.state.editingSurveyId.set(null);
    this.state.editingAdminToken.set(null);
    this.router.navigate(['/mes-sondages']);
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

  resetAndGoHome(): void {
    this.state.reset();
    this.router.navigate(['/']);
  }
}