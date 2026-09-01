import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  Survey,
  Proposition,
  SubmitVotePayload,
  MySurveySummary,
  MySurveyStatusFilter,
  MySurveysCounts,
  MySurveysPage,
  SurveyStats,
  SurveyStatsItem,
  RespondentEntry,
  PaginatedRespondents,
  OpenResponseEntry,
  PaginatedOpenResponses,
  NoteScale
} from '../models/survey.model';
import { SurveyTypeId } from '../models/question-type.model';

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
          const id = Math.random().toString(36).substring(2, 9);
          const responseToken = 'resp_' + Math.random().toString(36).substring(2, 10);
          const adminToken = 'adm_' + Math.random().toString(36).substring(2, 10);
          const mockSurvey: Survey = {
            id,
            responseToken,
            adminToken,
            title: surveyData.question?.text || 'Sondage',
            type: surveyData.type || 'qcm',
            creatorPseudo: surveyData.creatorPseudo,
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

  getSurveyByResponseToken(token: string): Observable<Survey | undefined> {
    return this.http.get<Survey>(`${this.baseUrl}/respond/${token}`).pipe(
      catchError(() => of(this.getLocalSurvey(token) || this.findMock(token, undefined)))
    );
  }

  getSurveyByAdminToken(token: string, adminToken: string): Observable<Survey | undefined> {
    return this.http
      .get<Survey>(`${this.baseUrl}/admin/${token}`, { headers: { 'X-Admin-Token': adminToken } })
      .pipe(catchError(() => of(this.getLocalSurvey(token) || this.findMock(token, adminToken))));
  }

  submitVote(payload: SubmitVotePayload): Observable<{ success: boolean; message?: string }> {
    return this.http
      .post<{ success: boolean; message?: string }>(
        `${this.baseUrl}/respond/${payload.responseToken}/vote`,
        payload
      )
      .pipe(
        catchError(() => {
          this.recordLocalVote(payload);
          return of({ success: true, message: 'Vote enregistré en mode local' });
        })
      );
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

  deleteMySurvey(surveyId: string): Observable<boolean> {
    const idx = this.mockMySurveys.findIndex((s) => s.id === surveyId);
    if (idx === -1) return of(false);
    this.mockMySurveys.splice(idx, 1);
    return of(true).pipe(delay(200));
  }

  /* ------------------------------------------------------------------ */
  /* Résultats                                                          */
  /* ------------------------------------------------------------------ */

  /** TODO backend : GET /api/surveys/results/:token/stats (+ header X-Admin-Token si admin) */
  getSurveyStats(token: string, adminToken?: string): Observable<SurveyStats | null> {
    const survey = this.findMock(token, adminToken) || this.getLocalSurvey(token);
    if (!survey) return of(null).pipe(delay(200));
    return of(this.buildMockStats(survey)).pipe(delay(300));
  }

  /** TODO backend : GET /api/surveys/results/:token/respondents?page=&pageSize= (admin) */
  getRespondents(
    token: string,
    page: number,
    pageSize: number,
    adminToken?: string
  ): Observable<PaginatedRespondents> {
    const survey = this.findMock(token, adminToken) || this.getLocalSurvey(token);
    if (!survey) return of({ items: [], page, pageSize, total: 0 }).pipe(delay(200));
    return of(this.buildMockRespondents(survey, page, pageSize)).pipe(delay(300));
  }

  /** TODO backend : GET /api/surveys/results/:token/responses?page=&pageSize= */
  getOpenResponses(
    token: string,
    page: number,
    pageSize: number,
    adminToken?: string
  ): Observable<PaginatedOpenResponses> {
    const survey = this.findMock(token, adminToken) || this.getLocalSurvey(token);
    if (!survey) return of({ items: [], page, pageSize, total: 0 }).pipe(delay(200));
    return of(this.buildMockOpenResponses(survey, page, pageSize)).pipe(delay(300));
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

  private recordLocalVote(payload: SubmitVotePayload): void {
    if (typeof localStorage === 'undefined') return;
    const votesKey = `decido_votes_${payload.responseToken}`;
    const existingVotes: SubmitVotePayload[] = JSON.parse(localStorage.getItem(votesKey) || '[]');
    existingVotes.push(payload);
    localStorage.setItem(votesKey, JSON.stringify(existingVotes));
  }

  private findMock(token: string, adminToken?: string): Survey | undefined {
    return this.mockMySurveys.find(
      (s) => s.responseToken === token || s.adminToken === token || (adminToken && s.adminToken === adminToken)
    );
  }

  // --- Mock "mes sondages" / "mes résultats" (à remplacer par le vrai backend) ---

  private readonly mockMySurveys: Survey[] = [
    this.buildMock('m1', 'Pizza ou sushi ce soir ?', 'duel', 'published', 245, 120 * 60_000, ['Pizza', 'Sushi']),
    this.buildMock('m2', 'Meilleur framework frontend en 2024 ?', 'qcm', 'published', 1024, 24 * 3_600_000, ['React', 'Angular', 'Vue', 'Svelte']),
    this.buildMock('m3', 'Faut-il adopter Tailwind CSS partout ?', 'qcm', 'closed', 56, 3 * 86_400_000, ['Oui', 'Non']),
    this.buildMock('m4', 'Nouvelle mascotte : laquelle ?', 'qcm', 'published', 63, 2 * 3_600_000, ['Renard', 'Loutre', 'Hibou']),
    this.buildMock('m5', 'On est chaud à combien pour la sortie ?', 'note', 'published', 34, 6 * 3_600_000, [], 5),
    this.buildMock('m6', 'Une idée de nom pour le projet ?', 'ouverte', 'draft', 0, 10 * 60_000, []),
    this.buildMock('m7', 'Match retour ou pas ?', 'duel', 'expired', 89, 10 * 86_400_000, ['Retour', 'Pas retour']),
    this.buildMock('m8', 'Sondage test', 'qcm', 'draft', 0, 30 * 60_000, ['Option A', 'Option B']),
    this.buildMock('m9', 'Ambiance générale du séminaire ?', 'note', 'closed', 48, 15 * 86_400_000, [], 10),
    this.buildMock('m10', 'Note globale du dernier sprint', 'note', 'expired', 21, 20 * 86_400_000, [], 20),
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
    optionTexts: string[],
    noteScale: NoteScale = 5
  ): Survey {
    const propositions: Proposition[] =
      type === 'note'
        ? Array.from({ length: noteScale }, (_, i) => ({
            id: `${id}-p${i}`,
            text: String(i + 1),
            orderIndex: i + 1,
            noteValue: i + 1
          }))
        : optionTexts.map((text, idx) => ({ id: `${id}-p${idx}`, text, orderIndex: idx + 1 }));

    // Démo : certains sondages sont créés anonymement (pseudo facultatif partout dans l'appli).
    const creatorPseudo = this.hashSeed(id) % 3 === 0 ? null : 'Marie';

    return {
      id,
      title,
      type,
      creatorPseudo,
      status,
      totalVotes,
      createdAt: new Date(Date.now() - ageMs).toISOString(),
      adminToken: `adm_${id}`,
      responseToken: `resp_${id}`,
      style: { themeIdx: 0, colorHex: '' },
      settings: { duration: '24h', resultsVisibility: 'private', oneVotePerDevice: true },
      question: {
        text: title,
        propositions,
        noteScale: type === 'note' ? noteScale : undefined
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

  // --- Génération déterministe de données de démo pour les résultats ---

  private readonly demoPseudos: (string | null)[] = [
    'Alex', 'Sami', 'Lina', 'Nora', 'Théo', 'Marie', 'Karim', 'Elise', 'Yasmine', 'Ali', null, null
  ];

  private hashSeed(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  private mulberry32(seed: number): () => number {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private buildMockStats(survey: Survey): SurveyStats {
    const total = survey.totalVotes || 0;
    const base: Omit<SurveyStats, 'items'> = {
      surveyId: survey.id || '',
      title: survey.title,
      type: survey.type,
      status: survey.status,
      creatorPseudo: survey.creatorPseudo,
      createdAt: survey.createdAt,
      totalVotes: total,
      noteScale: survey.question.noteScale
    };

    if (survey.type === 'ouverte') {
      return { ...base, items: [] };
    }

    const rand = this.mulberry32(this.hashSeed((survey.id || survey.title) + '-stats'));
    const props = survey.question.propositions || [];
    const weights = props.map(() => 0.3 + rand());
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    let remaining = total;
    const items: SurveyStatsItem[] = props.map((p, idx) => {
      const isLast = idx === props.length - 1;
      const count = isLast ? remaining : Math.round((weights[idx] / weightSum) * total);
      const safeCount = Math.max(0, Math.min(count, remaining));
      remaining -= safeCount;
      return {
        propositionId: p.id,
        text: p.text,
        noteValue: p.noteValue ?? undefined,
        voteCount: safeCount,
        percentage: total > 0 ? Math.round((safeCount / total) * 100) : 0
      };
    });

    let averageNote: number | undefined;
    if (survey.type === 'note') {
      const sum = items.reduce((acc, it) => acc + (it.noteValue || 0) * it.voteCount, 0);
      averageNote = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;
    }

    return { ...base, items, averageNote };
  }

  private buildMockRespondents(survey: Survey, page: number, pageSize: number): PaginatedRespondents {
    const total = survey.totalVotes || 0;
    const rand = this.mulberry32(this.hashSeed((survey.id || survey.title) + '-resp'));
    const props = survey.question.propositions || [];

    const start = (page - 1) * pageSize;
    const count = Math.max(0, Math.min(pageSize, total - start));

    const items: RespondentEntry[] = Array.from({ length: count }, (_, i) => {
      const globalIdx = start + i;
      const prop = props.length ? props[Math.floor(rand() * props.length)] : undefined;
      const pseudo = this.demoPseudos[Math.floor(rand() * this.demoPseudos.length)];
      const minutesAgo = Math.floor(rand() * 4000) + globalIdx;
      return {
        id: `${survey.id}-r${globalIdx}`,
        pseudo,
        answerText: prop ? prop.text : '',
        noteValue: prop?.noteValue ?? undefined,
        createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString()
      };
    });

    return { items, page, pageSize, total };
  }

  private buildMockOpenResponses(survey: Survey, page: number, pageSize: number): PaginatedOpenResponses {
    const sample = [
      "Super idée, j'adore !", 'Nova', 'Pulse', 'Kaleido', 'Je propose Zenith',
      'Aucune idée honnêtement 😅', 'On garde le nom actuel non ?', 'Flux', 'Orbit', 'Mira'
    ];
    const total = survey.totalVotes || 0;
    const rand = this.mulberry32(this.hashSeed((survey.id || survey.title) + '-open'));
    const start = (page - 1) * pageSize;
    const count = Math.max(0, Math.min(pageSize, total - start));

    const items: OpenResponseEntry[] = Array.from({ length: count }, (_, i) => {
      const globalIdx = start + i;
      const pseudo = this.demoPseudos[Math.floor(rand() * this.demoPseudos.length)];
      const minutesAgo = Math.floor(rand() * 4000) + globalIdx;
      return {
        id: `${survey.id}-o${globalIdx}`,
        pseudo,
        textResponse: sample[Math.floor(rand() * sample.length)],
        createdAt: new Date(Date.now() - minutesAgo * 60_000).toISOString()
      };
    });

    return { items, page, pageSize, total };
  }
}