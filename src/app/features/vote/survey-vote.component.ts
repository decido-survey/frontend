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
  template: `
    <app-topbar [showDots]="false" />

    <section class="screen">
      @if (loading()) {
        <div class="sub text-center" style="margin-top: 40px;">Chargement du sondage…</div>
      } @else if (!survey()) {
        <h1>Sondage introuvable 😕</h1>
        <div class="sub">Ce lien semble invalide ou a expiré.</div>
        <button class="btn btn-primary btn-block" (click)="goHome()">
          Créer un sondage
        </button>
      } @else if (voted()) {
        <div class="big-check">
          <svg lucideCheck class="w-8 h-8 text-white stroke-[3]"></svg>
        </div>
        <h1 class="text-center">Vote enregistré !</h1>
        <div class="sub text-center">Merci pour ta participation.</div>

        <button class="btn btn-primary btn-block" (click)="goToResults()">
          Voir les résultats →
        </button>
      } @else {
        <!-- Vote Form -->
        <div class="preview-eyebrow" style="text-transform: uppercase; margin-bottom: 4px;">
          SONDAGE · Par {{ survey()?.creatorPseudo || 'Anonyme' }}
        </div>
        <h1>{{ survey()?.question?.text }}</h1>

        <!-- Options based on type -->
        @if (survey()?.type === 'ouverte') {
          <label class="field-label">Ta réponse</label>
          <textarea
            rows="4"
            placeholder="Écris ton message ici…"
            [value]="textResponse()"
            (input)="onTextResponseInput($event)"
          ></textarea>
        } @else if (survey()?.type === 'note') {
          <label class="field-label">Ta note sur 5</label>
          <div class="flex gap-2 justify-center my-4">
            @for (star of [1, 2, 3, 4, 5]; track star) {
              <button
                class="type-card flex-row items-center justify-center p-3"
                [class.pressed]="selectedNote() === star"
                [style.background]="selectedNote() === star ? 'var(--accent)' : 'var(--panel)'"
                (click)="selectedNote.set(star)"
              >
                <span class="font-bold text-lg">{{ star }} ★</span>
              </button>
            }
          </div>
        } @else {
          <!-- QCM / Duel / Libre -->
          <label class="field-label">Sélectionne une réponse</label>
          <div class="flex flex-col gap-2.5 my-2">
            @for (prop of survey()?.question?.propositions; track getPropId(prop, $index)) {
              <button
                class="type-card flex-row items-center justify-between p-3.5"
                [class.pressed]="selectedPropositionId() === getPropId(prop, $index)"
                (click)="selectProposition(getPropId(prop, $index))"
              >
                <div class="flex items-center gap-3">
                  <div class="letter">{{ letters[$index] }}</div>
                  <span class="font-semibold text-sm">{{ prop.text }}</span>
                </div>
                @if (selectedPropositionId() === getPropId(prop, $index)) {
                  <svg lucideCheck class="w-4 h-4 text-ink stroke-[3]"></svg>
                }
              </button>
            }
          </div>
        }

        <!-- Respondent Pseudo Input (Mandatory) -->
        <label class="field-label" style="margin-top: 16px;">
          Ton pseudo <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="ex : Alex"
          [value]="respondentPseudo()"
          (input)="onPseudoInput($event)"
        />

        <button
          class="btn btn-primary btn-block"
          style="margin-top: 20px;"
          [disabled]="!canSubmit()"
          (click)="submitVote()"
        >
          <span>Envoyer ma réponse</span>
          <svg lucideChevronRight class="w-4 h-4 stroke-[2.5]"></svg>
        </button>
      }
    </section>
  `
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
    if (!this.respondentPseudo().trim()) return false;
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

    this.surveyService
      .submitVote({
        responseToken: token,
        respondentPseudo: this.respondentPseudo().trim(),
        propositionId: this.selectedPropositionId() || undefined,
        noteValue: this.selectedNote() || undefined,
        textResponse: this.textResponse() || undefined
      })
      .subscribe(() => {
        this.voted.set(true);
      });
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
