import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideTrash2 } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';
import { SurveyService } from '../../services/survey.service';
import { MySurveySummary } from '../../models/survey.model';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { BackLinkComponent } from '../../shared/components/back-link/back-link.component';

@Component({
  selector: 'app-my-surveys',
  standalone: true,
  imports: [LucideTrash2, TopbarComponent, BackLinkComponent],
  templateUrl: './my-surveys.component.html'
})
export class MySurveysComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly surveyService = inject(SurveyService);

  protected readonly loading = signal<boolean>(true);
  protected readonly surveys = signal<MySurveySummary[]>([]);
  protected readonly deletingId = signal<string | null>(null);

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

  manage(survey: MySurveySummary): void {
    this.router.navigate(['/s', survey.responseToken, 'admin', survey.adminToken]);
  }

  remove(survey: MySurveySummary, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Supprimer définitivement "${survey.title}" ?`)) return;
    this.deletingId.set(survey.id);
    this.surveyService.deleteSurveyAsAdmin(survey.id, survey.adminToken).subscribe((ok) => {
      this.deletingId.set(null);
      if (ok) {
        this.surveys.update((list) => list.filter((s) => s.id !== survey.id));
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}