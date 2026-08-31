import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  Survey,
  SubmitVotePayload,
  SurveyResults,
  SurveyResultItem,
  MySurveySummary,
  MySurveyStatusFilter,
  MySurveysCounts,
  MySurveysPage
} from '../models/survey.model';
import { SurveyTypeId } from '../models/question-type.model';
import { MOCK_MY_SURVEYS } from '../mocks/mock-my-surveys';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/surveys';

  createSurvey(surveyData: Partial<Survey>): Observable<{
    id: string;
    responseToken: string;
    adminToken: string;
    shareUrl: string;
    adminUrl: string;
  }> {
    return this.http
      .post<{
        id: string;
        responseToken: string;
        adminToken: string;
        shareUrl: string;
        adminUrl: string;
      }>(this.baseUrl, surveyData)
      .pipe(
        catchError(() => {
          // Fallback simulation for local offline testing
          const id = Math.random().toString(36).substring(2, 9);
          const responseToken = 'resp_' + Math.random().toString(36).substring(2, 10);
          const adminToken = 'adm_' + Math.random().toString(36).substring(2, 10);
          const mockSurvey: Survey = {
            id,
            responseToken,
            adminToken,
            title: surveyData.question?.text || 'Sondage',
            type: surveyData.type || 'qcm',
            creatorPseudo: surveyData.creatorPseudo || 'Anonyme',
            settings: surveyData.settings || {},
            question: surveyData.question || { text: '', propositions: [] }
          };
          this.saveLocalSurvey(responseToken, mockSurvey);
          return of({
            id,
            responseToken,
            adminToken,
            shareUrl: `${window.location.origin}/s/${responseToken}`,
            adminUrl: `${window.location.origin}/s/${responseToken}/admin/${adminToken}`
          });
        })
      );
  }

  getSurveyByResponseToken(token: string): Observable<Survey | null> {
    return this.http.get<Survey>(`${this.baseUrl}/respond/${token}`).pipe(
      catchError(() => {
        const local = this.getLocalSurvey(token);
        return of(local);
      })
    );
  }

  getSurveyByAdminToken(token: string, adminToken: string): Observable<Survey | null> {
    return this.http
      .get<Survey>(`${this.baseUrl}/admin/${token}`, {
        headers: { 'X-Admin-Token': adminToken }
      })
      .pipe(
        catchError(() => {
          const local = this.getLocalSurvey(token);
          return of(local);
        })
      );
  }

  submitVote(payload: SubmitVotePayload): Observable<{ success: boolean; message?: string }> {
    return this.http
      .post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/respond/${payload.responseToken}/vote`,
        payload
      )
      .pipe(
        catchError(() => {
          // Record vote locally if backend offline
          this.recordLocalVote(payload);
          return of({ success: true, message: 'Vote enregistré en mode local' });
        })
      );
  }

  getResults(token: string): Observable<SurveyResults | null> {
    return this.http.get<SurveyResults>(`${this.baseUrl}/results/${token}`).pipe(
      catchError(() => {
        const survey = this.getLocalSurvey(token);
        if (!survey) return of(null);
        return of(this.computeLocalResults(survey));
      })
    );
  }


    // --- Mock "mes sondages" (le vrai backend viendra remplacer ce bloc plus tard) ---

  private readonly mockMySurveys: Survey[] = [
    this.buildMock('m1', 'Pizza ou sushi ce soir ?', 'duel', 'published', 245, 120 * 60_000, ['Pizza', 'Sushi']),
    this.buildMock('m2', 'Meilleur framework frontend en 2024 ?', 'qcm', 'published', 1024, 24 * 3_600_000, ['React', 'Angular', 'Vue', 'Svelte']),
    this.buildMock('m3', 'Faut-il adopter Tailwind CSS partout ?', 'qcm', 'closed', 56, 3 * 86_400_000, ['Oui', 'Non']),
    this.buildMock('m4', 'Classe ces idées de fonctionnalités par priorité', 'libre', 'published', 12, 4 * 3_600_000, ['Mode sombre', 'Export PDF', 'Notifications', 'API publique']),
    this.buildMock('m5', 'On est chaud à combien pour la sortie ?', 'note', 'published', 34, 6 * 3_600_000, []),
    this.buildMock('m6', 'Une idée de nom pour le projet ?', 'ouverte', 'draft', 0, 10 * 60_000, []),
    this.buildMock('m7', 'Match retour ou pas ?', 'duel', 'expired', 89, 10 * 86_400_000, ['Retour', 'Pas retour']),
    this.buildMock('m8', 'Sondage test', 'qcm', 'draft', 0, 30 * 60_000, ['Option A', 'Option B']),
    this.buildMock('m9', 'Vote libre sur les couleurs', 'libre', 'closed', 5, 15 * 86_400_000, ['Bleu', 'Vert', 'Rouge']),
    this.buildMock('m10', 'Résultats du dernier sprint', 'note', 'expired', 21, 20 * 86_400_000, []),
    this.buildMock('m11', 'Nouveau logo : lequel préférez-vous ?', 'qcm', 'published', 178, 8 * 3_600_000, ['Logo A', 'Logo B', 'Logo C']),
    this.buildMock('m12', 'Café ou thé le matin ?', 'duel', 'published', 302, 24 * 3_600_000, ['Café', 'Thé']),
    this.buildMock('m13', 'Idée de team building', 'ouverte', 'draft', 0, 5 * 60_000, [])
  ];

  private buildMock(
    id: string,
    title: string,
    type: SurveyTypeId,
    status: 'draft' | 'published' | 'closed' | 'expired',
    totalVotes: number,
    ageMs: number,
    optionTexts: string[]
  ): Survey {
    return {
      id,
      title,
      type,
      creatorPseudo: 'Marie',
      status,
      totalVotes,
      createdAt: new Date(Date.now() - ageMs).toISOString(),
      adminToken: `adm_${id}`,
      responseToken: `resp_${id}`,
      style: { themeIdx: 0, colorHex: '' },
      settings: {
        duration: '24h',
        resultsVisibility: 'private',
        oneVotePerDevice: true
      },
      question: {
        text: title,
        propositions: optionTexts.map((text, idx) => ({
          id: `${id}-p${idx}`,
          text,
          orderIndex: idx + 1
        }))
      }
    };
  }

  private toSummary(s: Survey): MySurveySummary {
    return {
      id: s.id!,
      title: s.title,
      type: s.type,
      status: (s.status as MySurveySummary['status']) || 'draft',
      totalVotes: s.totalVotes || 0,
      createdAt: s.createdAt || new Date().toISOString(),
      responseToken: s.responseToken || '',
      adminToken: s.adminToken || ''
    };
  }

  /**
   * Simule GET /api/users/me/surveys?status=...&page=...&pageSize=...
   * → à remplacer par le vrai appel HTTP une fois le backend branché.
   */
  getMySurveys(
    page: number,
    pageSize: number,
    status: MySurveyStatusFilter = 'all'
  ): Observable<MySurveysPage> {
    const all = this.mockMySurveys.map((s) => this.toSummary(s));

    const counts: MySurveysCounts = {
      all: all.length,
      draft: all.filter((s) => s.status === 'draft').length,
      published: all.filter((s) => s.status === 'published').length,
      closed: all.filter((s) => s.status === 'closed').length,
      expired: all.filter((s) => s.status === 'expired').length
    };

    const filtered = status === 'all' ? all : all.filter((s) => s.status === status);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return of({ items, page, pageSize, total: filtered.length, counts }).pipe(delay(250));
  }

  getMySurveyById(id: string): Observable<Survey | null> {
    const found = this.mockMySurveys.find((s) => s.id === id) || null;
    return of(found).pipe(delay(150));
  }

  updateMySurvey(surveyId: string, changes: Partial<Survey>): Observable<Survey | null> {
    const idx = this.mockMySurveys.findIndex((s) => s.id === surveyId);
    if (idx === -1) return of(null);
    const current = this.mockMySurveys[idx];
    const updated: Survey = {
      ...current,
      ...changes,
      question: changes.question ? { ...current.question, ...changes.question } : current.question,
      settings: changes.settings ? { ...current.settings, ...changes.settings } : current.settings,
      style: changes.style ? { ...current.style, ...changes.style } : current.style
    };
    this.mockMySurveys[idx] = updated;
    return of(updated).pipe(delay(200));
  }

  // --- Local Storage Fallbacks ---
  private saveLocalSurvey(token: string, survey: Survey): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`decido_survey_${token}`, JSON.stringify(survey));
    }
  }

  private getLocalSurvey(token: string): Survey | null {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(`decido_survey_${token}`);
      if (item) {
        try {
          return JSON.parse(item) as Survey;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  deleteMySurvey(surveyId: string): Observable<boolean> {
    const idx = this.mockMySurveys.findIndex((s) => s.id === surveyId);
    if (idx === -1) return of(false);
    this.mockMySurveys.splice(idx, 1);
    return of(true).pipe(delay(200));
  }

  private recordLocalVote(payload: SubmitVotePayload): void {
    if (typeof localStorage === 'undefined') return;
    const votesKey = `decido_votes_${payload.responseToken}`;
    const existingVotes: SubmitVotePayload[] = JSON.parse(
      localStorage.getItem(votesKey) || '[]'
    );
    existingVotes.push(payload);
    localStorage.setItem(votesKey, JSON.stringify(existingVotes));
  }

  private computeLocalResults(survey: Survey): SurveyResults {
    const votesKey = `decido_votes_${survey.responseToken}`;
    const votes: SubmitVotePayload[] =
      typeof localStorage !== 'undefined'
        ? JSON.parse(localStorage.getItem(votesKey) || '[]')
        : [];

    const totalVotes = votes.length;
    const props = survey.question.propositions || [];
    const items: SurveyResultItem[] = props.map((p, idx) => {
      const pVotes = votes.filter(
        (v) => v.propositionId === p.id || v.propositionId === String(idx)
      ).length;
      return {
        propositionId: p.id || String(idx),
        text: p.text,
        voteCount: pVotes,
        percentage: totalVotes > 0 ? Math.round((pVotes / totalVotes) * 100) : 0
      };
    });

    const openResponses = votes
      .filter((v) => v.textResponse)
      .map((v) => ({
        pseudo: v.respondentPseudo,
        text: v.textResponse || '',
        createdAt: new Date().toISOString()
      }));

    return {
      surveyId: survey.id || '1',
      title: survey.title,
      type: survey.type,
      creatorPseudo: survey.creatorPseudo,
      totalVotes,
      items,
      openResponses
    };
  }
}
