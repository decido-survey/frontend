import { MySurveySummary } from '../models/survey.model';

export const MOCK_MY_SURVEYS: MySurveySummary[] = [
  {
    id: 's1',
    title: 'Préférence de pause-café',
    type: 'qcm',
    status: 'published',
    totalVotes: 42,
    createdAt: '2026-08-01T10:00:00Z',
    responseToken: 'resp_pause_cafe',
    adminToken: 'adm_pause_cafe'
  },
  {
    id: 's2',
    title: 'Choix du design du nouveau logo',
    type: 'qcm',
    status: 'closed',
    totalVotes: 128,
    createdAt: '2026-07-15T14:30:00Z',
    responseToken: 'resp_logo',
    adminToken: 'adm_logo'
  },
  {
    id: 's3',
    title: "Sondage d'équipe: journée remote ou présentiel ?",
    type: 'duel',
    status: 'draft',
    totalVotes: 8,
    createdAt: '2026-08-20T08:15:00Z',
    responseToken: 'resp_remote',
    adminToken: 'adm_remote'
  }
];
