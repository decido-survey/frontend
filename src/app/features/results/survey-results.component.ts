import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../services/survey.service';
import { SurveyStats, RespondentDisplayItem, PaginatedRespondents, PaginatedOpenResponses, RespondentEntry, OpenResponseEntry } from '../../models/survey.model';
import { Observable } from 'rxjs';
import { QUESTION_TYPES } from '../../models/question-type.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BackLinkComponent } from '../../shared/components/back-link/back-link.component';
import { ResultBarComponent } from '../../shared/components/result-bar/result-bar.component';
import { DuelBarComponent } from '../../shared/components/duel-bar/duel-bar.component';
import { NoteHistogramComponent } from '../../shared/components/note-histogram/note-histogram.component';
import { RespondentsListComponent } from '../../shared/components/respondents-list/respondents-list.component';

const DETAIL_PAGE_SIZE = 8;

@Component({
  selector: 'app-survey-results',
  standalone: true,
  imports: [TopbarComponent, BackLinkComponent, ResultBarComponent, DuelBarComponent, NoteHistogramComponent, RespondentsListComponent],
  templateUrl: './survey-results.component.html',
  styleUrl: './survey-results.component.css'
})
export class SurveyResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly stats = signal<SurveyStats | null>(null);

  protected readonly detailItems = signal<RespondentDisplayItem[]>([]);
  protected readonly detailPage = signal(1);
  protected readonly detailTotal = signal(0);
  protected readonly detailLoading = signal(false);
  protected readonly detailLoadingMore = signal(false);

  private token = '';
  private adminToken: string | null = null;

  protected readonly isAdmin = computed(() => !!this.adminToken);
  protected readonly hasMoreDetails = computed(() => this.detailItems().length < this.detailTotal());

  protected readonly typeInfo = computed(() => {
    const t = this.stats()?.type;
    return QUESTION_TYPES.find((q) => q.id === t) || null;
  });

  // Le détail nominatif (qui a répondu quoi) n'est visible que par l'admin,
  // sauf pour les questions ouvertes dont les réponses restent lisibles par tous.
  protected readonly showDetailSection = computed(() => {
    const t = this.stats()?.type;
    if (!t) return false;
    return t === 'ouverte' || this.isAdmin();
  });

  protected readonly detailSectionTitle = computed(() =>
    this.stats()?.type === 'ouverte' ? 'Réponses' : 'Répondants'
  );

  protected readonly noteDistribution = computed<number[]>(() => {
    const s = this.stats();
    if (!s || s.type !== 'note') return [];
    const scale = s.noteScale || 5;
    const dist = new Array(scale).fill(0);
    for (const item of s.items) {
      if (item.noteValue && item.noteValue >= 1 && item.noteValue <= scale) {
        dist[item.noteValue - 1] = item.voteCount;
      }
    }
    return dist;
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    this.adminToken = this.route.snapshot.paramMap.get('adminToken');

    if (!this.token) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.surveyService.getSurveyStats(this.token, this.adminToken || undefined).subscribe((data) => {
      this.loading.set(false);
      if (!data) {
        this.notFound.set(true);
        return;
      }
      this.stats.set(data);
      if (this.showDetailSection()) {
        this.loadDetailPage(1, false);
      }
    });
  }

  protected loadMoreDetails(): void {
    if (this.detailLoadingMore() || !this.hasMoreDetails()) return;
    this.loadDetailPage(this.detailPage() + 1, true);
  }

  private loadDetailPage(page: number, append: boolean): void {
    const type = this.stats()?.type;
    if (!type) return;

    if (append) this.detailLoadingMore.set(true);
    else this.detailLoading.set(true);

    const request$: Observable<PaginatedOpenResponses | PaginatedRespondents> =
      type === 'ouverte'
        ? this.surveyService.getOpenResponses(this.token, page, DETAIL_PAGE_SIZE, this.adminToken || undefined)
        : this.surveyService.getRespondents(this.token, page, DETAIL_PAGE_SIZE, this.adminToken || undefined);

    request$.subscribe((res: PaginatedOpenResponses | PaginatedRespondents) => {
      this.detailLoading.set(false);
      this.detailLoadingMore.set(false);
      this.detailPage.set(page);
      this.detailTotal.set(res.total);

      const mapped: RespondentDisplayItem[] = res.items.map((it: OpenResponseEntry | RespondentEntry) => ({
        pseudo: it.pseudo,
        answer: 'textResponse' in it ? it.textResponse : it.answerText,
        createdAt: it.createdAt
      }));

      this.detailItems.update((prev) => (append ? [...prev, ...mapped] : mapped));
    });
  }

  protected statusLabel(): string {
    const map: Record<string, string> = { draft: 'Brouillon', published: 'Actif', closed: 'Clos', expired: 'Expiré' };
    const s = this.stats()?.status;
    return s ? map[s] || s : '';
  }

  protected onBack(): void {
    this.router.navigate([this.isAdmin() ? '/mes-resultats' : '/']);
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }

  protected timeAgo(iso?: string): string {
    if (!iso) return '';
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }
}