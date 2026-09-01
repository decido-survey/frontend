import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideCheck, LucideChevronRight } from '@lucide/angular';
import { SurveyService } from '../../services/survey.service';
import { ThemeService } from '../../services/theme.service';
import { Survey, Proposition } from '../../models/survey.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-survey-vote',
  standalone: true,
  imports: [LucideCheck, LucideChevronRight, TopbarComponent],
  templateUrl: './survey-vote.component.html'
})
export class SurveyVoteComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);
  private readonly themeService = inject(ThemeService);

  protected readonly loading = signal<boolean>(true);
  protected readonly survey = signal<Survey | null>(null);
  protected readonly selectedPropositionId = signal<string | null>(null);
  protected readonly selectedNote = signal<number | null>(null);
  protected readonly textResponse = signal<string>('');
  protected readonly respondentPseudo = signal<string>('');
  protected readonly voted = signal<boolean>(false);

  protected readonly letters = 'ABCDEFGH';

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.surveyService.getSurveyByResponseToken(token).subscribe((data) => {
        this.loading.set(false);
        if (data) {
          this.survey.set(data);
          if (data.type) {
            this.themeService.setAccentForTypeAndIndex(data.type, data.style?.themeIdx || 0);
          }
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  protected getPropId(prop: Proposition, index: number): string {
    return prop.id || ('' + index);
  }

  protected selectProposition(id: string): void {
    this.selectedPropositionId.set(id);
  }

  protected onTextResponseInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.textResponse.set(target.value);
  }

  protected onPseudoInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.respondentPseudo.set(target.value);
  }

  protected canSubmit(): boolean {
    //if (!this.respondentPseudo().trim()) return false;
    const s = this.survey();
    if (!s) return false;
    if (s.type === 'ouverte') return this.textResponse().trim().length > 0;
    if (s.type === 'note') return this.selectedNote() !== null;
    return this.selectedPropositionId() !== null;
  }

  protected submitVote(): void {
    const s = this.survey();
    const token = this.route.snapshot.paramMap.get('token');
    if (!s || !token || !this.canSubmit()) return;

    this.surveyService.submitVote({
      responseToken: token,
      respondentPseudo: this.respondentPseudo().trim() || undefined,
      propositionId: this.selectedPropositionId() || undefined,
      noteValue: this.selectedNote() || undefined,
      textResponse: this.textResponse() || undefined
    }).subscribe(() => this.voted.set(true));
  }


  protected currentNoteScale(): number {
    return this.survey()?.question?.noteScale || 5;
  }

  protected noteRange(): number[] {
    return Array.from({ length: this.currentNoteScale() }, (_, i) => i + 1);
  }

  protected goToResults(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.router.navigate(['/s', token, 'results']);
    }
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
