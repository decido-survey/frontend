import { SurveyTypeId } from './question-type.model';

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
}

export interface SurveyStyle {
  themeIdx: number;
  colorHex: string;
}

export interface Survey {
  id?: string;
  userId?: string | null;
  creatorPseudo?: string;
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
  respondentPseudo: string;
  propositionId?: string;
  noteValue?: number;
  textResponse?: string;
  sessionId?: string;
}

export interface SurveyResultItem {
  propositionId?: string;
  text?: string;
  noteValue?: number;
  voteCount: number;
  percentage: number;
}

export interface MySurveySummary {
  id: string;
  title: string;
  type: string;
  status: string;
  totalVotes: number;
  createdAt: string;
  responseToken: string;
  adminToken: string;
}

export interface SurveyResults {
  surveyId: string;
  title: string;
  type: SurveyTypeId;
  creatorPseudo?: string;
  totalVotes: number;
  items: SurveyResultItem[];
  openResponses?: { pseudo: string; text: string; createdAt: string }[];
}
