import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import {
  Survey,
  SubmitVotePayload,
  SurveyResults,
  SurveyResultItem,
  MySurveySummary
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

  getMySurveys(): Observable<MySurveySummary[]> {
    return this.http.get<any[]>('/api/users/me/surveys').pipe(
      map((list) =>
        (list || []).map((s) => ({
          id: s.id,
          title: s.title,
          type: (s.type || '').toString().toLowerCase(),
          status: (s.status || '').toString().toLowerCase(),
          totalVotes: s.results?.totalVotes ?? 0,
          createdAt: s.createdAt,
          responseToken: s.responseToken,
          adminToken: s.adminToken
        }))
      ),
      catchError(() => of(MOCK_MY_SURVEYS))
    );
  }

  deleteSurveyAsAdmin(surveyId: string, adminToken: string): Observable<boolean> {
    return this.http
      .delete(`${this.baseUrl}/${surveyId}`, { headers: { 'X-Admin-Token': adminToken } })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
