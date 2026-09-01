import { SurveyTypeId } from './question-type.model';

export type NoteScale = 3 | 5 | 10 | 20;

export interface SurveySettings {
  expiresAt?: string | null;
  duration?: '1h' | '24h' | '7d' | 'unlimited';
  resultsVisibility?: 'public' | 'private';
  oneVotePerDevice?: boolean;
}

export interface Proposition {
  id?: string;
  questionId?: string;
  text: string;
  orderIndex: number;
  noteValue?: number | null;
  isActive?: boolean;
  voteCount?: number;
}

export interface Question {
  id?: string;
  surveyId?: string;
  text: string;
  orderIndex?: number;
  required?: boolean;
  propositions: Proposition[];
  /** Uniquement pour le type "note" : échelle proposée aux répondants. */
  noteScale?: NoteScale;
}

export interface SurveyStyle {
  themeIdx: number;
  colorHex: string;
}

export interface Survey {
  id?: string;
  userId?: string | null;
  /** Facultatif : l'appli peut être utilisée anonymement. */
  creatorPseudo?: string | null;
  title: string;
  description?: string;
  type: SurveyTypeId;
  style?: SurveyStyle;
  settings: SurveySettings;
  adminToken?: string;
  responseToken?: string;
  status?: 'draft' | 'published' | 'closed' | 'expired';
  createdAt?: string;
  updatedAt?: string;
  question: Question;
  totalVotes?: number;
}

export interface SubmitVotePayload {
  responseToken: string;
  /** Facultatif : un répondant peut voter anonymement. */
  respondentPseudo?: string;
  propositionId?: string;
  noteValue?: number;
  textResponse?: string;
  sessionId?: string;
}

export type MySurveyStatusFilter = 'all' | 'draft' | 'published' | 'closed' | 'expired';

export interface MySurveysCounts {
  all: number;
  draft: number;
  published: number;
  closed: number;
  expired: number;
}

export interface MySurveySummary {
  id: string;
  title: string;
  type: SurveyTypeId;
  status: 'draft' | 'published' | 'closed' | 'expired';
  totalVotes: number;
  createdAt: string;
  responseToken: string;
  adminToken: string;
}

export interface MySurveysPage {
  items: MySurveySummary[];
  page: number;
  pageSize: number;
  total: number;
  counts: MySurveysCounts;
}

/* ------------------------------------------------------------------ */
/* Résultats — endpoint "stats" (agrégats) : GET /results/:token/stats */
/* ------------------------------------------------------------------ */

export interface SurveyStatsItem {
  propositionId?: string;
  text?: string;
  /** Pour "note" : la valeur (1..noteScale) que représente cette barre. */
  noteValue?: number;
  voteCount: number;
  percentage: number;
}

export interface SurveyStats {
  surveyId: string;
  title: string;
  type: SurveyTypeId;
  status?: 'draft' | 'published' | 'closed' | 'expired';
  creatorPseudo?: string | null;
  createdAt?: string;
  totalVotes: number;
  /** QCM / Duel / Note : une entrée par proposition (ou par valeur de note). */
  items: SurveyStatsItem[];
  /** Uniquement pour "note". */
  averageNote?: number;
  noteScale?: NoteScale;
}

/* ------------------------------------------------------------------ */
/* Résultats — endpoint "détail" paginé (qui a répondu quoi)          */
/* ------------------------------------------------------------------ */

export interface RespondentEntry {
  id: string;
  /** null/absent si le répondant n'a pas renseigné de pseudo (vote anonyme). */
  pseudo?: string | null;
  /** Libellé de la proposition choisie, ou de la note donnée. */
  answerText: string;
  noteValue?: number;
  createdAt: string;
}

export interface PaginatedRespondents {
  items: RespondentEntry[];
  page: number;
  pageSize: number;
  total: number;
}

export interface OpenResponseEntry {
  id: string;
  pseudo?: string | null;
  textResponse: string;
  createdAt: string;
}

export interface PaginatedOpenResponses {
  items: OpenResponseEntry[];
  page: number;
  pageSize: number;
  total: number;
}

/** Format générique consommé par <app-respondents-list>, quel que soit l'endpoint d'origine. */
export interface RespondentDisplayItem {
  pseudo?: string | null;
  answer: string;
  createdAt: string;
}