import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucidePlus, LucideChevronLeft, LucideChevronRight, LucideTrash2, LucideX } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';
import { MySurveySummary, MySurveyStatusFilter, MySurveysCounts } from '../../models/survey.model';
import { QUESTION_TYPES } from '../../models/question-type.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BackLinkComponent } from '../../shared/components/back-link/back-link.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-my-surveys',
  standalone: true,
  imports: [
    LucidePlus,
    LucideChevronLeft,
    LucideChevronRight,
    LucideTrash2,
    LucideX,
    TopbarComponent,
    BackLinkComponent
  ],
  templateUrl: './my-surveys.component.html',
  styleUrl: './my-surveys.component.css'
})
export class MySurveysComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  protected readonly loading = signal<boolean>(true);
  protected readonly surveys = signal<MySurveySummary[]>([]);
  protected readonly page = signal<number>(1);
  protected readonly total = signal<number>(0);
  protected readonly counts = signal<MySurveysCounts>({ all: 0, draft: 0, published: 0, closed: 0, expired: 0 });
  protected readonly statusFilter = signal<MySurveyStatusFilter>('all');
  protected readonly pageSize = PAGE_SIZE;

  protected readonly surveyToDelete = signal<MySurveySummary | null>(null);
  protected readonly deleting = signal<boolean>(false);

  protected readonly tabs: { id: MySurveyStatusFilter; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'draft', label: 'Brouillons' },
    { id: 'published', label: 'Actifs' },
    { id: 'closed', label: 'Clos' },
    { id: 'expired', label: 'Expirés' }
  ];

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));
  protected readonly isLastPage = computed(() => this.page() >= this.totalPages());

  protected readonly pageNumbers = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const keep = new Set<number>([1, total, current, current - 1, current + 1]);
    const sorted = Array.from(keep).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (prev && p - prev > 1) result.push('…');
      result.push(p);
      prev = p;
    }
    return result;
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.surveyService.getMySurveys(this.page(), this.pageSize, this.statusFilter()).subscribe((res) => {
      this.surveys.set(res.items);
      this.total.set(res.total);
      this.counts.set(res.counts);
      this.loading.set(false);
    });
  }

  selectTab(tab: MySurveyStatusFilter): void {
    if (this.statusFilter() === tab) return;
    this.statusFilter.set(tab);
    this.page.set(1);
    this.load();
  }

  goToPage(p: number | '…'): void {
    if (p === '…' || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  openSurvey(survey: MySurveySummary): void {
    this.router.navigate(['/create', survey.id]);
  }

  createNew(): void {
    this.router.navigate(['/create']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  confirmDelete(survey: MySurveySummary, event: Event): void {
    event.stopPropagation();
    this.surveyToDelete.set(survey);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.surveyToDelete.set(null);
  }

  performDelete(): void {
    const survey = this.surveyToDelete();
    if (!survey) return;
    this.deleting.set(true);
    this.surveyService.deleteMySurvey(survey.id).subscribe((ok) => {
      this.deleting.set(false);
      this.surveyToDelete.set(null);
      if (ok) {
        const remainingOnPage = this.surveys().length - 1;
        if (remainingOnPage <= 0 && this.page() > 1) {
          this.page.update((p) => p - 1);
        }
        this.load();
      }
    });
  }

  typeLabel(typeId: string): string {
    return QUESTION_TYPES.find((t) => t.id === typeId)?.name || typeId;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Brouillon',
      published: 'Actif',
      closed: 'Clos',
      expired: 'Expiré'
    };
    return map[status] || status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      draft: '#C7CADA',
      published: '#12B886',
      closed: '#14141F',
      expired: '#E53E3E'
    };
    return map[status] || '#C7CADA';
  }

  timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  }
}